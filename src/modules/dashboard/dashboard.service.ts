import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { Between, MoreThan, Repository } from 'typeorm';
import { ElasticsearchService } from '../../common/elasticsearch.service';

import { Appointment, AppointmentStatus } from '../appointments/entities/appointment.entity';
import { Clinic } from '../clinics/entities/clinic.entity';

import { User, UserRole } from '../users/entities/user.entity';

import { DashboardFiltersDto, DashboardStatsDto, ElasticsearchAggregationBucket, ElasticsearchHit, ElasticsearchQuery, RecentActivityItemDto, TopPerformingClinicDto } from './dto/dashboard-stats.dto';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);
  private readonly CACHE_TTL = 300; // 5 minutes
  private readonly CACHE_KEYS = {
    DASHBOARD_STATS: 'dashboard:stats',
    DASHBOARD_CHARTS: 'dashboard:charts',
    RECENT_ACTIVITY: 'dashboard:recent_activity',
    TOP_CLINICS: 'dashboard:top_clinics',
    NEW_USERS_WEEK: 'dashboard:new_users_week',
    NEW_CLINICS_MONTH: 'dashboard:new_clinics_month',
  };

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Clinic)
    private readonly clinicRepository: Repository<Clinic>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,

    private readonly elasticsearchService: ElasticsearchService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache
  ) {}

  async getDashboardStats(filters: DashboardFiltersDto = {}): Promise<DashboardStatsDto> {
    const cacheKey = `${this.CACHE_KEYS.DASHBOARD_STATS}:${JSON.stringify(filters)}`;

    // Try to get from cache first
    const cachedStats = await this.cacheManager.get<DashboardStatsDto>(cacheKey);
    if (cachedStats) {
      this.logger.debug('Returning cached dashboard stats');
      return cachedStats;
    }

    try {
      // Use hybrid approach: database for real-time, Elasticsearch for analytics
      const [userStats, appointmentStats, clinicStats, recentActivity, topClinics] = await Promise.all([
        this.getUserStats(filters),
        this.getAppointmentStats(filters),
        this.getClinicStats(filters),
        this.getRecentActivity(),
        this.getTopPerformingClinics(),
      ]);

      const stats: DashboardStatsDto = {
        totalUsers: userStats.totalUsers,
        totalVeterinarians: userStats.totalVeterinarians,
        totalPatients: userStats.totalPatients,
        newUsersThisWeek: userStats.newUsersThisWeek,

        totalAppointments: appointmentStats.totalAppointments,
        appointmentsToday: appointmentStats.appointmentsToday,
        pendingAppointments: appointmentStats.pendingAppointments,
        completedAppointments: appointmentStats.completedAppointments,
        cancelledAppointments: appointmentStats.cancelledAppointments,
        urgentAppointments: appointmentStats.urgentAppointments,
        averageAppointmentDuration: appointmentStats.averageAppointmentDuration,

        totalClinics: clinicStats.totalClinics,
        newClinicsThisMonth: clinicStats.newClinicsThisMonth,

        revenueThisMonth: 0, // TODO: Implement when payment system is ready
        growthRate: 0, // TODO: Calculate based on historical data

        recentActivity,
        topPerformingClinics: topClinics,
      };

      // Cache the results
      await this.cacheManager.set(cacheKey, stats, this.CACHE_TTL);

      return stats;
    } catch (error) {
      this.logger.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  private async getUserStats(filters: DashboardFiltersDto) {
    const cacheKey = `${this.CACHE_KEYS.NEW_USERS_WEEK}:${JSON.stringify(filters)}`;

    // Use Elasticsearch for user counts if available, otherwise fallback to database
    if (this.elasticsearchService.isServiceEnabled()) {
      try {
        return await this.getUserStatsFromElasticsearch(filters);
      } catch (error) {
        this.logger.warn('Elasticsearch user stats failed, falling back to database:', error);
      }
    }

    // Database fallback
    const totalUsers = await this.userRepository.count();
    const totalVeterinarians = await this.userRepository.count({
      where: { role: UserRole.VETERINARIAN },
    });
    const totalPatients = await this.userRepository.count({
      where: { role: UserRole.PATIENT },
    });

    // Get cached new users count or calculate
    let newUsersThisWeek = await this.cacheManager.get<number>(cacheKey);
    if (newUsersThisWeek === undefined) {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      newUsersThisWeek = await this.userRepository.count({
        where: { createdAt: MoreThan(oneWeekAgo) },
      });
      await this.cacheManager.set(cacheKey, newUsersThisWeek, this.CACHE_TTL);
    }

    return {
      totalUsers,
      totalVeterinarians,
      totalPatients,
      newUsersThisWeek,
    };
  }

  private async getUserStatsFromElasticsearch(filters: DashboardFiltersDto) {
    // Use Elasticsearch aggregations for better performance
    const query: ElasticsearchQuery = {
      index: 'users',
      size: 0, // We only need aggregations
      query: this.buildDateRangeQuery(filters),
      aggs: {
        total_users: { value_count: { field: 'id' } },
        roles: {
          terms: { field: 'role' },
        },
        new_users_week: {
          filter: {
            range: {
              createdAt: {
                gte: 'now-7d/d',
                lte: 'now/d',
              },
            },
          },
        },
      },
    };

    const result = await this.elasticsearchService.search(query);
    const aggs = result.aggregations;

    return {
      totalUsers: aggs?.total_users?.value || 0,
      totalVeterinarians: aggs?.roles?.buckets?.find((b: ElasticsearchAggregationBucket) => b.key === 'veterinarian')?.doc_count || 0,
      totalPatients: aggs?.roles?.buckets?.find((b: ElasticsearchAggregationBucket) => b.key === 'patient')?.doc_count || 0,
      newUsersThisWeek: aggs?.new_users_week?.doc_count || 0,
    };
  }

  private async getAppointmentStats(filters: DashboardFiltersDto) {
    // Use database for appointment stats with optimized queries
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalAppointments, appointmentsToday, pendingCount, completedCount, cancelledCount] = await Promise.all([
      this.appointmentRepository.count(this.buildAppointmentFilters(filters)),
      this.appointmentRepository.count({
        ...this.buildAppointmentFilters(filters),
        where: {
          ...this.buildAppointmentFilters(filters).where,
          scheduled_date: Between(today, tomorrow),
        },
      }),
      this.appointmentRepository.count({
        ...this.buildAppointmentFilters(filters),
        where: {
          ...this.buildAppointmentFilters(filters).where,
          status: AppointmentStatus.PENDING,
        },
      }),
      this.appointmentRepository.count({
        ...this.buildAppointmentFilters(filters),
        where: {
          ...this.buildAppointmentFilters(filters).where,
          status: AppointmentStatus.COMPLETED,
        },
      }),
      this.appointmentRepository.count({
        ...this.buildAppointmentFilters(filters),
        where: {
          ...this.buildAppointmentFilters(filters).where,
          status: AppointmentStatus.CANCELLED,
        },
      }),
    ]);

    // Calculate average duration
    const avgDurationResult = await this.appointmentRepository
      .createQueryBuilder('appointment')
      .select('AVG(appointment.duration_minutes)', 'avg_duration')
      .where('appointment.duration_minutes IS NOT NULL')
      .andWhere('appointment.duration_minutes > 0')
      .getRawOne();

    const averageAppointmentDuration = Math.round(avgDurationResult?.avg_duration || 0);

    return {
      totalAppointments,
      appointmentsToday,
      pendingAppointments: pendingCount,
      completedAppointments: completedCount,
      cancelledAppointments: cancelledCount,
      urgentAppointments: 0, // TODO: Implement urgent appointment logic
      averageAppointmentDuration,
    };
  }

  private async getClinicStats(filters: DashboardFiltersDto) {
    const cacheKey = `${this.CACHE_KEYS.NEW_CLINICS_MONTH}:${JSON.stringify(filters)}`;

    const totalClinics = await this.clinicRepository.count();

    // Get cached new clinics count or calculate
    let newClinicsThisMonth = await this.cacheManager.get<number>(cacheKey);
    if (newClinicsThisMonth === undefined) {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      newClinicsThisMonth = await this.clinicRepository.count({
        where: { created_at: MoreThan(oneMonthAgo) },
      });
      await this.cacheManager.set(cacheKey, newClinicsThisMonth, this.CACHE_TTL);
    }

    return {
      totalClinics,
      newClinicsThisMonth,
    };
  }

  private async getRecentActivity(): Promise<RecentActivityItemDto[]> {
    const cacheKey = this.CACHE_KEYS.RECENT_ACTIVITY;

    // Check cache first
    const cachedActivity = await this.cacheManager.get<RecentActivityItemDto[]>(cacheKey);
    if (cachedActivity) {
      return cachedActivity;
    }

    try {
      // Use Elasticsearch for recent activity if available
      if (this.elasticsearchService.isServiceEnabled()) {
        const recentActivity = await this.getRecentActivityFromElasticsearch();
        await this.cacheManager.set(cacheKey, recentActivity, this.CACHE_TTL);
        return recentActivity;
      }
    } catch (error) {
      this.logger.warn('Elasticsearch recent activity failed, falling back to database:', error);
    }

    // Database fallback
    const [recentUsers, recentAppointments] = await Promise.all([
      this.userRepository.find({
        order: { createdAt: 'DESC' },
        take: 5,
        select: ['id', 'firstName', 'lastName', 'createdAt', 'role'],
      }),
      this.appointmentRepository.find({
        order: { created_at: 'DESC' },
        take: 5,
        relations: ['owner', 'clinic'],
        select: ['id', 'created_at', 'owner', 'clinic'],
      }),
    ]);

    const activities: RecentActivityItemDto[] = [];

    // Add recent user registrations
    recentUsers.forEach((user) => {
      activities.push({
        id: `user_${user.id}`,
        type: 'user_registration',
        description: `New ${user.role} registered`,
        timestamp: user.createdAt.toISOString(),
        userName: `${user.firstName} ${user.lastName}`,
      });
    });

    // Add recent appointments
    recentAppointments.forEach((appointment) => {
      activities.push({
        id: `appointment_${appointment.id}`,
        type: 'appointment_created',
        description: 'New appointment scheduled',
        timestamp: appointment.created_at.toISOString(),
        userName: appointment.owner ? `${appointment.owner.firstName} ${appointment.owner.lastName}` : 'Unknown',
        clinicName: appointment.clinic?.name || 'Unknown',
      });
    });

    // Sort and limit
    const sortedActivities = activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

    await this.cacheManager.set(cacheKey, sortedActivities, this.CACHE_TTL);
    return sortedActivities;
  }

  private async getRecentActivityFromElasticsearch(): Promise<RecentActivityItemDto[]> {
    // Multi-search query across users and appointments indices
    const query: ElasticsearchQuery = {
      index: 'users,appointments', // Elasticsearch supports comma-separated indices
      size: 10,
      sort: [{ createdAt: 'desc' }],
      query: {
        range: {
          createdAt: {
            gte: 'now-30d/d', // Last 30 days
          },
        },
      },
    };

    const result = await this.elasticsearchService.search(query);

    return (
      result.hits?.hits?.map((hit: ElasticsearchHit) => ({
        id: hit._source.id,
        type: hit._index === 'users' ? 'user_registration' : 'appointment_created',
        description: hit._index === 'users' ? `New ${hit._source.role} registered` : 'New appointment scheduled',
        timestamp: hit._source.createdAt,
        userName: hit._source.firstName ? `${hit._source.firstName} ${hit._source.lastName}` : hit._source.ownerName,
        clinicName: hit._source.clinicName,
      })) || []
    );
  }

  private async getTopPerformingClinics(): Promise<TopPerformingClinicDto[]> {
    const cacheKey = this.CACHE_KEYS.TOP_CLINICS;

    // Check cache first
    const cachedClinics = await this.cacheManager.get<TopPerformingClinicDto[]>(cacheKey);
    if (cachedClinics) {
      return cachedClinics;
    }

    try {
      // Use Elasticsearch aggregations for clinic performance
      if (this.elasticsearchService.isServiceEnabled()) {
        const topClinics = await this.getTopClinicsFromElasticsearch();
        await this.cacheManager.set(cacheKey, topClinics, this.CACHE_TTL);
        return topClinics;
      }
    } catch (error) {
      this.logger.warn('Elasticsearch top clinics failed, falling back to database:', error);
    }

    // Database fallback
    const clinics = await this.clinicRepository.find({
      order: { rating: 'DESC' },
      take: 5,
      select: ['id', 'name', 'rating'],
    });

    const topClinics: TopPerformingClinicDto[] = clinics.map((clinic) => ({
      id: clinic.id,
      name: clinic.name,
      rating: clinic.rating || 0,
      revenue: 0, // TODO: Implement when payment system is ready
      totalAppointments: 0, // TODO: Calculate from appointments table
    }));

    await this.cacheManager.set(cacheKey, topClinics, this.CACHE_TTL);
    return topClinics;
  }

  private async getTopClinicsFromElasticsearch(): Promise<TopPerformingClinicDto[]> {
    const query: ElasticsearchQuery = {
      index: 'clinics',
      size: 5,
      sort: [{ rating: 'desc' }],
      source: ['id', 'name', 'rating'],
      query: { match_all: {} },
    };

    const result = await this.elasticsearchService.search(query);

    return (
      result.hits?.hits?.map((hit: ElasticsearchHit) => ({
        id: hit._source.id,
        name: hit._source.name,
        rating: hit._source.rating || 0,
        revenue: 0,
        totalAppointments: 0,
      })) || []
    );
  }

  private buildDateRangeQuery(filters: DashboardFiltersDto) {
    if (!filters.dateRange) return { match_all: {} };

    return {
      range: {
        createdAt: {
          gte: filters.dateRange[0],
          lte: filters.dateRange[1],
        },
      },
    };
  }

  private buildAppointmentFilters(filters: DashboardFiltersDto) {
    // Using any for TypeORM query builder compatibility
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (filters.clinicId) {
      where.clinic_id = filters.clinicId;
    }

    if (filters.dateRange) {
      where.scheduled_date = Between(new Date(filters.dateRange[0]), new Date(filters.dateRange[1]));
    }

    return { where };
  }

  // Get dashboard charts data
  async getDashboardCharts(filters: DashboardFiltersDto = {}) {
    const cacheKey = `${this.CACHE_KEYS.DASHBOARD_CHARTS}:${JSON.stringify(filters)}`;

    // Try to get from cache first
    const cachedCharts = await this.cacheManager.get(cacheKey);
    if (cachedCharts) {
      this.logger.debug('Returning cached dashboard charts');
      return cachedCharts;
    }

    try {
      // Get data for charts
      const [appointmentStats, userStats, clinicStats] = await Promise.all([this.getAppointmentStatsForCharts(filters), this.getUserStatsForCharts(filters), this.getClinicStatsForCharts(filters)]);

      // Prepare chart data
      const chartsData = {
        appointmentStatusChart: this.buildAppointmentStatusChart(appointmentStats),
        appointmentTypeChart: this.buildAppointmentTypeChart(),
        userRoleChart: this.buildUserRoleChart(userStats),
        clinicPerformanceChart: this.buildClinicPerformanceChart(clinicStats),
      };

      // Cache the results
      await this.cacheManager.set(cacheKey, chartsData, this.CACHE_TTL);

      return chartsData;
    } catch (error) {
      this.logger.error('Error fetching dashboard charts:', error);
      throw error;
    }
  }

  // Helper methods for charts data
  private async getAppointmentStatsForCharts(filters: DashboardFiltersDto) {
    const appointments = await this.appointmentRepository.find({
      where: this.buildAppointmentFilters(filters).where,
      select: ['status', 'appointment_type'],
    });

    return appointments;
  }

  private async getUserStatsForCharts(_filters: DashboardFiltersDto) {
    // Note: Clinic filtering for users might require a different relationship
    // For now, we'll get all users since clinic filtering is complex
    const users = await this.userRepository.find({
      select: ['role'],
    });

    return users;
  }

  private async getClinicStatsForCharts(_filters: DashboardFiltersDto) {
    const clinics = await this.clinicRepository.find({
      select: ['id', 'name', 'rating'],
      take: 10,
      order: { rating: 'DESC' },
    });

    return clinics;
  }

  private buildAppointmentStatusChart(appointments: Appointment[]) {
    const statusCounts = appointments.reduce(
      (acc, appointment) => {
        acc[appointment.status] = (acc[appointment.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: this.getStatusColor(status),
    }));
  }

  private buildAppointmentTypeChart() {
    // Mock data for appointment types since not available in current schema
    return [
      { name: 'Consultation', value: 45, color: '#1890ff' },
      { name: 'Vaccination', value: 30, color: '#52c41a' },
      { name: 'Surgery', value: 15, color: '#fa8c16' },
      { name: 'Emergency', value: 10, color: '#ff4d4f' },
    ];
  }

  private buildUserRoleChart(users: User[]) {
    const roleCounts = users.reduce(
      (acc, user) => {
        if (user.role) {
          acc[user.role] = (acc[user.role] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(roleCounts).map(([role, count]) => ({
      name: role.charAt(0).toUpperCase() + role.slice(1),
      value: count,
      color: this.getRoleColor(role),
    }));
  }

  private buildClinicPerformanceChart(clinics: Clinic[]) {
    return clinics.slice(0, 5).map((clinic) => ({
      name: clinic.name,
      rating: clinic.rating || 0,
      color: '#8b5cf6',
    }));
  }

  private getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: '#faad14',
      confirmed: '#52c41a',
      in_progress: '#1890ff',
      completed: '#52c41a',
      cancelled: '#ff4d4f',
      no_show: '#ff7875',
      rescheduled: '#722ed1',
      waiting: '#eb2f96',
    };
    return colors[status] || '#d9d9d9';
  }

  private getRoleColor(role: string): string {
    const colors: Record<string, string> = {
      admin: '#ff4d4f',
      veterinarian: '#1890ff',
      staff: '#52c41a',
      patient: '#faad14',
    };
    return colors[role] || '#d9d9d9';
  }

  // Cache invalidation methods
  async invalidateDashboardCache() {
    const cacheKeys = Object.values(this.CACHE_KEYS);
    await Promise.all(cacheKeys.map((key) => this.cacheManager.del(key)));
    this.logger.debug('Dashboard cache invalidated');
  }

  async invalidateStatsCache(filters: DashboardFiltersDto = {}) {
    const cacheKey = `${this.CACHE_KEYS.DASHBOARD_STATS}:${JSON.stringify(filters)}`;
    await this.cacheManager.del(cacheKey);
    this.logger.debug('Dashboard stats cache invalidated');
  }

  async invalidateChartsCache(filters: DashboardFiltersDto = {}) {
    const cacheKey = `${this.CACHE_KEYS.DASHBOARD_CHARTS}:${JSON.stringify(filters)}`;
    await this.cacheManager.del(cacheKey);
    this.logger.debug('Dashboard charts cache invalidated');
  }
}
