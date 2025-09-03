import { ApiProperty } from '@nestjs/swagger';

export class DashboardStatsDto {
  @ApiProperty({ description: 'Total number of users' })
  totalUsers!: number;

  @ApiProperty({ description: 'Total number of appointments' })
  totalAppointments!: number;

  @ApiProperty({ description: 'Total number of veterinarians' })
  totalVeterinarians!: number;

  @ApiProperty({ description: 'Total number of patients' })
  totalPatients!: number;

  @ApiProperty({ description: 'Appointments scheduled for today' })
  appointmentsToday!: number;

  @ApiProperty({ description: 'Pending appointments' })
  pendingAppointments!: number;

  @ApiProperty({ description: 'Completed appointments' })
  completedAppointments!: number;

  @ApiProperty({ description: 'Cancelled appointments' })
  cancelledAppointments!: number;

  @ApiProperty({ description: 'Urgent appointments' })
  urgentAppointments!: number;

  @ApiProperty({ description: 'Monthly revenue' })
  revenueThisMonth!: number;

  @ApiProperty({ description: 'Growth rate percentage' })
  growthRate!: number;

  @ApiProperty({ description: 'New users this week' })
  newUsersThisWeek!: number;

  @ApiProperty({ description: 'Total clinics' })
  totalClinics!: number;

  @ApiProperty({ description: 'New clinics this month' })
  newClinicsThisMonth!: number;

  @ApiProperty({ description: 'Average appointment duration in minutes' })
  averageAppointmentDuration!: number;

  @ApiProperty({ description: 'Recent activity items' })
  recentActivity!: RecentActivityItemDto[];

  @ApiProperty({ description: 'Top performing clinics' })
  topPerformingClinics!: TopPerformingClinicDto[];
}

export class RecentActivityItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  timestamp!: string;

  @ApiProperty({ required: false })
  userName?: string;

  @ApiProperty({ required: false })
  clinicName?: string;
}

export class TopPerformingClinicDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  rating!: number;

  @ApiProperty()
  revenue!: number;

  @ApiProperty()
  totalAppointments!: number;
}

export class DashboardFiltersDto {
  @ApiProperty({ required: false, description: 'Date range for filtering stats' })
  dateRange?: [string, string];

  @ApiProperty({ required: false, description: 'Clinic ID to filter by' })
  clinicId?: string;
}

// Elasticsearch interfaces (matching SearchQuery from ElasticsearchService)
export interface ElasticsearchQuery {
  index: string;
  query: Record<string, unknown>;
  size?: number;
  from?: number;
  sort?: Array<Record<string, unknown>>;
  aggs?: Record<string, unknown>;
  highlight?: Record<string, unknown>;
  source?: string[] | boolean;
}

export interface ElasticsearchHit {
  _index: string;
  _source: Record<string, unknown>;
  _score?: number;
  _id?: string;
  highlight?: Record<string, string[]>;
}

export interface ElasticsearchAggregationBucket {
  key: string;
  doc_count: number;
}

export interface ElasticsearchAggregation {
  buckets?: ElasticsearchAggregationBucket[];
  value?: number;
  doc_count?: number;
}

export interface ElasticsearchAggregations {
  [key: string]: ElasticsearchAggregation;
}

export interface ElasticsearchSearchResult {
  hits: {
    hits?: ElasticsearchHit[];
    total?: { value: number };
  };
  aggregations?: ElasticsearchAggregations;
}

// TypeORM interfaces
export interface AppointmentWhereClause {
  clinic_id?: string;
  scheduled_date?: any; // Using any for TypeORM Between operator
  status?: string;
  created_at?: any;
}
