import { Injectable, Logger } from '@nestjs/common';

import { ClinicWithDistanceDto } from './dto/clinic-with-distance.dto';
import { FindClinicDto } from './dto/find-clinic.dto';
import { GeocodingService, PlaceSearchResult } from '../../common/services/geocoding.service';

@Injectable()
export class ClinicFinderService {
  private readonly logger = new Logger(ClinicFinderService.name);

  // Map service types to Geoapify Places API categories
  private readonly serviceTypeToCategories: Record<string, string[]> = {
    // Grooming: try pet service (grooming), then pet shops (many offer grooming services)
    grooming: ['pet.service', 'pet.shop'],
    shop: ['pet.shop'],
    retail: ['pet.shop'],
    // Veterinary services - all map to pet.veterinary category
    check: ['pet.veterinary'],
    consultation: ['pet.veterinary'],
    vaccination: ['pet.veterinary'],
    emergency: ['pet.veterinary'],
    surgery: ['pet.veterinary'],
    wellness: ['pet.veterinary'],
    preventive: ['pet.veterinary'],
    diagnostic: ['pet.veterinary'],
    dental: ['pet.veterinary'],
    therapy: ['pet.veterinary'],
    veterinary: ['pet.veterinary'],
    circumcision: ['pet.veterinary'], // Surgical procedure - veterinary service
    boarding: ['pet'], // Use general pet category for boarding
    shelter: ['pet'], // Use general pet category for shelters
  };

  constructor(private readonly geocodingService: GeocodingService) {}

  /**
   * Get search query text for fallback text-based search
   */
  private getSearchQueryForServiceType(serviceType: string): string {
    const queryMap: Record<string, string> = {
      grooming: 'pet grooming',
      shop: 'pet shop',
      retail: 'pet store',
      check: 'veterinary clinic',
      consultation: 'veterinary clinic',
      vaccination: 'veterinary clinic',
      emergency: 'veterinary emergency',
      surgery: 'veterinary clinic',
      wellness: 'veterinary clinic',
      preventive: 'veterinary clinic',
      diagnostic: 'veterinary clinic',
      dental: 'veterinary dental',
      therapy: 'veterinary clinic',
      veterinary: 'veterinary clinic',
      circumcision: 'veterinary clinic',
      boarding: 'pet boarding',
      shelter: 'animal shelter',
    };
    return queryMap[serviceType.toLowerCase()] || serviceType;
  }

  /**
   * Find nearby places based on user location and service type using Geoapify Places API
   */
  async findNearbyClinics(findDto: FindClinicDto): Promise<{
    clinics: ClinicWithDistanceDto[];
    total: number;
    radiusKm: number;
    serviceType: string;
  }> {
    const { latitude, longitude, serviceType, radiusKm = 10 } = findDto;

    this.logger.log(`Searching Geoapify Places API for ${serviceType} near (${latitude}, ${longitude}) within ${radiusKm}km`);

    // Get Geoapify categories for this service type
    const categories = this.serviceTypeToCategories[serviceType.toLowerCase()];

    if (!categories || categories.length === 0) {
      this.logger.warn(`No Geoapify categories mapped for service type: ${serviceType}`);
      return {
        clinics: [],
        total: 0,
        radiusKm,
        serviceType,
      };
    }

    try {
      // Query Geoapify Places API with categories
      let places: PlaceSearchResult[] = [];
      try {
        places = await this.geocodingService.searchPlacesByTags(
          latitude,
          longitude,
          categories,
          radiusKm,
          50 // limit
        );
      } catch (geoapifyError) {
        this.logger.warn(`Geoapify Places API query failed, trying fallback: ${geoapifyError}`);
        places = [];
      }

      // Fallback: If no results from category-based search, try text-based search
      if (places.length === 0) {
        this.logger.log(`No results from category-based search, trying text-based fallback for: ${serviceType}`);
        try {
          const searchQuery = this.getSearchQueryForServiceType(serviceType);
          places = await this.geocodingService.searchPlacesNearby(
            latitude,
            longitude,
            searchQuery,
            radiusKm,
            50 // limit
          );
        } catch (fallbackError) {
          this.logger.warn(`Fallback search also failed: ${fallbackError}`);
          places = [];
        }
      }

      const clinics: ClinicWithDistanceDto[] = places.map((place) => {
        // Build address string
        const addressParts: string[] = [];
        if (place.address?.house_number) addressParts.push(place.address.house_number);
        if (place.address?.road) addressParts.push(place.address.road);
        const address = addressParts.length > 0 ? addressParts.join(' ') : place.displayName;

        return {
          id: place.placeId || `osm_${place.latitude}_${place.longitude}`,
          name: place.name,
          description: place.displayName,
          address,
          city: place.address?.city || '',
          ...(place.address?.state && { state: place.address.state }),
          ...(place.address?.postcode && { postal_code: place.address.postcode }),
          country: place.address?.country || '',
          distanceKm: this.geocodingService.calculateDistance(latitude, longitude, place.latitude, place.longitude),
          latitude: place.latitude,
          longitude: place.longitude,
          rating: 0, // OpenStreetMap doesn't provide ratings
          total_reviews: 0,
          is_verified: false,
          services: [serviceType],
          specializations: place.category ? [place.category] : [],
        };
      });

      // Sort by distance (already sorted by Geoapify, but ensure it)
      clinics.sort((a, b) => a.distanceKm - b.distanceKm);

      this.logger.log(`Found ${clinics.length} places from Geoapify Places API`);

      return {
        clinics,
        total: clinics.length,
        radiusKm,
        serviceType,
      };
    } catch (error) {
      this.logger.error(`Error searching with Geoapify Places API:`, error);
      // Return empty result on error
      return {
        clinics: [],
        total: 0,
        radiusKm,
        serviceType,
      };
    }
  }

  /**
   * Find the best (closest) place for the given service type
   */
  async findBestClinic(findDto: FindClinicDto): Promise<ClinicWithDistanceDto | null> {
    const result = await this.findNearbyClinics(findDto);
    return result.clinics.length > 0 ? result.clinics[0]! : null;
  }
}
