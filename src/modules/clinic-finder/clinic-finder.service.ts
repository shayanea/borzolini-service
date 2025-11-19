import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppointmentType } from '../appointments/entities/appointment.entity';
import { Clinic } from '../clinics/entities/clinic.entity';
import { ServiceCategory } from '../clinics/entities/clinic-service.entity';
import { GeocodingService } from '../../common/services/geocoding.service';
import { FindClinicDto } from './dto/find-clinic.dto';
import { ClinicWithDistanceDto } from './dto/clinic-with-distance.dto';

@Injectable()
export class ClinicFinderService {
  private readonly logger = new Logger(ClinicFinderService.name);

  constructor(
    @InjectRepository(Clinic)
    private readonly clinicRepository: Repository<Clinic>,
    private readonly geocodingService: GeocodingService,
  ) {}

  /**
   * Find nearby clinics based on user location and service type
   */
  async findNearbyClinics(findDto: FindClinicDto): Promise<{
    clinics: ClinicWithDistanceDto[];
    total: number;
    radiusKm: number;
    serviceType: string;
  }> {
    const { latitude, longitude, serviceType, radiusKm = 10, minRating, verifiedOnly } = findDto;

    this.logger.log(
      `Finding clinics near (${latitude}, ${longitude}) for service type: ${serviceType} within ${radiusKm}km`,
    );

    // Get all active clinics
    const queryBuilder = this.clinicRepository
      .createQueryBuilder('clinic')
      .where('clinic.is_active = :isActive', { isActive: true })
      .leftJoinAndSelect('clinic.clinic_services', 'clinic_services')
      .andWhere('clinic_services.is_active = :serviceActive', { serviceActive: true });

    // Apply filters
    if (minRating !== undefined) {
      queryBuilder.andWhere('clinic.rating >= :minRating', { minRating });
    }

    if (verifiedOnly) {
      queryBuilder.andWhere('clinic.is_verified = :verified', { verified: true });
    }

    const clinics = await queryBuilder.getMany();

    // Filter clinics by service type and calculate distances
    const clinicsWithDistance: ClinicWithDistanceDto[] = [];

    for (const clinic of clinics) {
      // Check if clinic offers the requested service type
      if (!this.clinicOffersServiceType(clinic, serviceType)) {
        continue;
      }

      // Geocode clinic address if needed
      let clinicLat: number | undefined;
      let clinicLng: number | undefined;

      try {
        const geocodeResult = await this.geocodingService.geocodeAddress(
          clinic.address,
          clinic.city,
          clinic.state || undefined,
          clinic.postal_code || undefined,
        );
        clinicLat = geocodeResult.latitude;
        clinicLng = geocodeResult.longitude;
      } catch (error) {
        this.logger.warn(`Failed to geocode clinic ${clinic.id}: ${clinic.address}`, error);
        // Skip clinics that can't be geocoded
        continue;
      }

      // Calculate distance
      const distanceKm = this.geocodingService.calculateDistance(
        latitude,
        longitude,
        clinicLat!,
        clinicLng!,
      );

      // Filter by radius
      if (distanceKm > radiusKm) {
        continue;
      }

      // Build response DTO
      const clinicWithDistance: ClinicWithDistanceDto = {
        id: clinic.id,
        name: clinic.name,
        ...(clinic.description && { description: clinic.description }),
        address: clinic.address,
        city: clinic.city,
        ...(clinic.state && { state: clinic.state }),
        ...(clinic.postal_code && { postal_code: clinic.postal_code }),
        country: clinic.country,
        ...(clinic.phone && { phone: clinic.phone }),
        ...(clinic.email && { email: clinic.email }),
        ...(clinic.website && { website: clinic.website }),
        ...(clinic.logo_url && { logo_url: clinic.logo_url }),
        rating: clinic.rating,
        total_reviews: clinic.total_reviews,
        is_verified: clinic.is_verified,
        services: clinic.services || [],
        specializations: clinic.specializations || [],
        distanceKm,
        ...(clinicLat !== undefined && { latitude: clinicLat }),
        ...(clinicLng !== undefined && { longitude: clinicLng }),
      };

      clinicsWithDistance.push(clinicWithDistance);
    }

    // Sort by distance (closest first), then by rating
    clinicsWithDistance.sort((a, b) => {
      if (Math.abs(a.distanceKm - b.distanceKm) < 0.1) {
        // If distance is very similar, sort by rating
        return b.rating - a.rating;
      }
      return a.distanceKm - b.distanceKm;
    });

    this.logger.log(`Found ${clinicsWithDistance.length} clinics matching criteria`);

    return {
      clinics: clinicsWithDistance,
      total: clinicsWithDistance.length,
      radiusKm,
      serviceType,
    };
  }

  /**
   * Find the best (closest) clinic for the given service type
   */
  async findBestClinic(findDto: FindClinicDto): Promise<ClinicWithDistanceDto | null> {
    const result = await this.findNearbyClinics(findDto);
    return result.clinics.length > 0 ? result.clinics[0]! : null;
  }

  /**
   * Check if a clinic offers the requested service type
   */
  private clinicOffersServiceType(clinic: Clinic, serviceType: string): boolean {
    const normalizedServiceType = serviceType.toLowerCase().trim();

    // Check AppointmentType enum
    const appointmentTypes = Object.values(AppointmentType).map((v) => v.toLowerCase());
    if (appointmentTypes.includes(normalizedServiceType)) {
      // Check if clinic has services array containing this type
      if (clinic.services && Array.isArray(clinic.services)) {
        const servicesLower = clinic.services.map((s) => s.toLowerCase());
        if (servicesLower.includes(normalizedServiceType)) {
          return true;
        }
      }

      // Check clinic_services relationship
      if (clinic.clinic_services && clinic.clinic_services.length > 0) {
        // Check if any service name or category matches
        const matches = clinic.clinic_services.some((service) => {
          const serviceName = service.name.toLowerCase();
          const category = service.category.toLowerCase();
          return (
            serviceName.includes(normalizedServiceType) ||
            category.includes(normalizedServiceType) ||
            normalizedServiceType === category
          );
        });
        if (matches) return true;
      }
    }

    // Check ServiceCategory enum
    const serviceCategories = Object.values(ServiceCategory).map((v) => v.toLowerCase());
    if (serviceCategories.includes(normalizedServiceType)) {
      // Check clinic_services for matching category
      if (clinic.clinic_services && clinic.clinic_services.length > 0) {
        const matches = clinic.clinic_services.some(
          (service) => service.category.toLowerCase() === normalizedServiceType,
        );
        if (matches) return true;
      }
    }

    // Handle "shop" or "retail" type - check for retail/pet supplies
    if (normalizedServiceType === 'shop' || normalizedServiceType === 'retail') {
      if (clinic.services && Array.isArray(clinic.services)) {
        const servicesLower = clinic.services.map((s) => s.toLowerCase());
        const retailKeywords = ['retail', 'shop', 'supplies', 'store', 'pet supplies', 'pet store'];
        const hasRetail = retailKeywords.some((keyword) =>
          servicesLower.some((service) => service.includes(keyword)),
        );
        if (hasRetail) return true;
      }

      // Check specializations
      if (clinic.specializations && Array.isArray(clinic.specializations)) {
        const specializationsLower = clinic.specializations.map((s) => s.toLowerCase());
        const retailKeywords = ['retail', 'shop', 'supplies', 'store'];
        const hasRetail = retailKeywords.some((keyword) =>
          specializationsLower.some((spec) => spec.includes(keyword)),
        );
        if (hasRetail) return true;
      }
    }

    // Check clinic services array (string matching)
    if (clinic.services && Array.isArray(clinic.services)) {
      const servicesLower = clinic.services.map((s) => s.toLowerCase());
      if (servicesLower.includes(normalizedServiceType)) {
        return true;
      }
      // Also check if any service contains the service type
      if (servicesLower.some((service) => service.includes(normalizedServiceType))) {
        return true;
      }
    }

    // Check specializations
    if (clinic.specializations && Array.isArray(clinic.specializations)) {
      const specializationsLower = clinic.specializations.map((s) => s.toLowerCase());
      if (specializationsLower.includes(normalizedServiceType)) {
        return true;
      }
      // Also check if any specialization contains the service type
      if (specializationsLower.some((spec) => spec.includes(normalizedServiceType))) {
        return true;
      }
    }

    // Check clinic_services names
    if (clinic.clinic_services && clinic.clinic_services.length > 0) {
      const matches = clinic.clinic_services.some((service) => {
        const serviceName = service.name.toLowerCase();
        return serviceName.includes(normalizedServiceType);
      });
      if (matches) return true;
    }

    return false;
  }
}

