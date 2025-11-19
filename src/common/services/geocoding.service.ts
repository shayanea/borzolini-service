import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

import { ConfigService } from '@nestjs/config';

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  displayName?: string;
}

export interface ReverseGeocodeResult {
  address: string;
  displayName: string;
}

export interface PlaceSearchResult {
  placeId: string;
  name: string;
  latitude: number;
  longitude: number;
  displayName: string;
  address?: {
    road?: string;
    house_number?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
  type?: string;
  category?: string;
}

@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);
  private readonly httpClient: AxiosInstance;
  private readonly geoapifyClient: AxiosInstance;
  private readonly baseUrl = 'https://nominatim.openstreetmap.org';
  private readonly geoapifyBaseUrl = 'https://api.geoapify.com';
  private readonly cache = new Map<string, GeocodeResult>();
  private readonly rateLimitDelay = 1000; // 1 second delay between requests (Nominatim requires max 1 req/sec)
  private readonly geoapifyApiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.geoapifyApiKey = this.configService.get<string>('GEOAPIFY_API_KEY') || '';

    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        'User-Agent': 'Borzolini-Service/1.0 (pet clinic management platform)',
      },
    });

    this.geoapifyClient = axios.create({
      baseURL: this.geoapifyBaseUrl,
      timeout: 30000,
      headers: {
        'User-Agent': 'Borzolini-Service/1.0 (pet clinic management platform)',
      },
    });

    if (!this.geoapifyApiKey) {
      this.logger.warn('GEOAPIFY_API_KEY not found in environment variables');
    }
  }

  /**
   * Geocode an address to get latitude and longitude coordinates
   * @param address Full address string
   * @param city Optional city name
   * @param state Optional state/province
   * @param postalCode Optional postal code
   * @returns Promise with latitude and longitude
   */
  async geocodeAddress(address: string, city?: string, state?: string, postalCode?: string): Promise<GeocodeResult> {
    // Build full address string
    const addressParts: string[] = [address];
    if (city) addressParts.push(city);
    if (state) addressParts.push(state);
    if (postalCode) addressParts.push(postalCode);

    const fullAddress = addressParts.join(', ');
    const cacheKey = fullAddress.toLowerCase().trim();

    // Check cache first
    if (this.cache.has(cacheKey)) {
      this.logger.debug(`Cache hit for address: ${fullAddress}`);
      return this.cache.get(cacheKey)!;
    }

    try {
      // Rate limiting: wait 1 second between requests
      await this.delay(this.rateLimitDelay);

      const response = await this.httpClient.get('/search', {
        params: {
          q: fullAddress,
          format: 'json',
          limit: 1,
          addressdetails: 1,
        },
      });

      if (!response.data || response.data.length === 0) {
        this.logger.warn(`No geocoding results found for address: ${fullAddress}`);
        throw new Error(`Could not geocode address: ${fullAddress}`);
      }

      const result = response.data[0];
      const geocodeResult: GeocodeResult = {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        displayName: result.display_name,
      };

      // Cache the result
      this.cache.set(cacheKey, geocodeResult);

      this.logger.debug(`Geocoded address: ${fullAddress} -> ${geocodeResult.latitude}, ${geocodeResult.longitude}`);
      return geocodeResult;
    } catch (error) {
      this.logger.error(`Error geocoding address: ${fullAddress}`, error);
      throw new Error(`Geocoding failed for address: ${fullAddress}`);
    }
  }

  /**
   * Reverse geocode coordinates to get an address
   * @param latitude Latitude coordinate
   * @param longitude Longitude coordinate
   * @returns Promise with address information
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<ReverseGeocodeResult> {
    try {
      // Rate limiting
      await this.delay(this.rateLimitDelay);

      const response = await this.httpClient.get('/reverse', {
        params: {
          lat: latitude,
          lon: longitude,
          format: 'json',
          addressdetails: 1,
        },
      });

      if (!response.data || !response.data.display_name) {
        throw new Error(`Could not reverse geocode coordinates: ${latitude}, ${longitude}`);
      }

      const result: ReverseGeocodeResult = {
        address: response.data.address || '',
        displayName: response.data.display_name,
      };

      this.logger.debug(`Reverse geocoded: ${latitude}, ${longitude} -> ${result.displayName}`);
      return result;
    } catch (error) {
      this.logger.error(`Error reverse geocoding coordinates: ${latitude}, ${longitude}`, error);
      throw new Error(`Reverse geocoding failed for coordinates: ${latitude}, ${longitude}`);
    }
  }

  /**
   * Search for places near a location using Geoapify Places API
   * @param latitude User latitude
   * @param longitude User longitude
   * @param categories Array of Geoapify category filters (e.g., ["healthcare.veterinary", "shop.pet"])
   * @param radiusKm Search radius in kilometers
   * @param limit Maximum number of results
   */
  async searchPlacesByTags(latitude: number, longitude: number, categories: string[], radiusKm: number = 10, limit: number = 50): Promise<PlaceSearchResult[]> {
    if (!this.geoapifyApiKey) {
      this.logger.error('GEOAPIFY_API_KEY is not configured');
      throw new Error('Geoapify API key is not configured');
    }

    try {
      // Convert radius to meters for Geoapify
      const radiusMeters = radiusKm * 1000;

      // Build categories string (comma-separated)
      const categoriesStr = categories.join(',');

      // Build filter: circle with center and radius
      const filter = `circle:${longitude},${latitude},${radiusMeters}`;

      this.logger.debug(`Geoapify Places API query: categories=${categoriesStr}, filter=${filter}`);

      const response = await this.geoapifyClient.get('/v2/places', {
        params: {
          categories: categoriesStr,
          filter,
          limit: Math.min(limit, 100), // Geoapify max limit is 100
          apiKey: this.geoapifyApiKey,
        },
      });

      if (!response.data || !response.data.features || !Array.isArray(response.data.features)) {
        this.logger.warn('Invalid response from Geoapify Places API');
        return [];
      }

      const places: PlaceSearchResult[] = [];

      for (const feature of response.data.features) {
        if (!feature.geometry || !feature.geometry.coordinates) {
          continue;
        }

        const [lng, lat] = feature.geometry.coordinates;
        const properties = feature.properties || {};

        // Calculate distance
        const distance = this.calculateDistance(latitude, longitude, lat, lng);
        if (distance > radiusKm) {
          continue;
        }

        // Extract name
        const name = properties.name || properties.name_en || 'Unknown';

        // Extract address components (Geoapify uses different property names)
        const addressData: PlaceSearchResult['address'] = {};
        if (properties.housenumber) addressData.house_number = properties.housenumber;
        if (properties.street) addressData.road = properties.street;
        if (properties.city) addressData.city = properties.city;
        if (properties.state) addressData.state = properties.state;
        if (properties.postcode) addressData.postcode = properties.postcode;
        if (properties.country) addressData.country = properties.country;

        // Build display name
        const addressParts: string[] = [];
        if (addressData.house_number) addressParts.push(addressData.house_number);
        if (addressData.road) addressParts.push(addressData.road);
        const addressStr = addressParts.length > 0 ? addressParts.join(' ') : '';
        const city = addressData.city || '';
        const displayName = [name, addressStr, city].filter(Boolean).join(', ') || name;

        // Extract category
        const category = properties.categories?.[0] || properties.category || '';

        places.push({
          placeId: feature.properties?.place_id?.toString() || feature.id?.toString() || `geoapify_${lat}_${lng}`,
          name,
          latitude: lat,
          longitude: lng,
          displayName,
          ...(Object.keys(addressData).length > 0 && { address: addressData }),
          ...(category && { category }),
        });

        // Limit results
        if (places.length >= limit) {
          break;
        }
      }

      // Sort by distance
      places.sort((a, b) => {
        const distA = this.calculateDistance(latitude, longitude, a.latitude, a.longitude);
        const distB = this.calculateDistance(latitude, longitude, b.latitude, b.longitude);
        return distA - distB;
      });

      this.logger.debug(`Found ${places.length} places from Geoapify Places API`);
      return places;
    } catch (error) {
      this.logger.error(`Error searching places with Geoapify Places API:`, error);
      if (axios.isAxiosError(error)) {
        this.logger.error(`Geoapify API error: ${error.response?.status} - ${error.response?.statusText}`);
        this.logger.error(`Response data: ${JSON.stringify(error.response?.data)}`);
      }
      throw new Error(`Geoapify Places API search failed`);
    }
  }

  /**
   * Search for places near a location using OpenStreetMap Nominatim (fallback)
   * @param latitude User latitude
   * @param longitude User longitude
   * @param query Search query (e.g., "pet store", "veterinary", "grooming")
   * @param radiusKm Search radius in kilometers
   * @param limit Maximum number of results
   */
  async searchPlacesNearby(latitude: number, longitude: number, query: string, radiusKm: number = 10, limit: number = 20): Promise<PlaceSearchResult[]> {
    try {
      // Rate limiting
      await this.delay(this.rateLimitDelay);

      // Use Nominatim's search with proximity bias
      const response = await this.httpClient.get('/search', {
        params: {
          q: query,
          format: 'json',
          limit,
          addressdetails: 1,
          extratags: 1,
          namedetails: 1,
          // Use viewbox to bias results near user location
          viewbox: `${longitude - 0.1},${latitude + 0.1},${longitude + 0.1},${latitude - 0.1}`,
          bounded: 0, // Don't strictly bound, just bias
        },
      });

      if (!response.data || !Array.isArray(response.data)) {
        return [];
      }

      const places: PlaceSearchResult[] = [];

      for (const result of response.data) {
        const placeLat = parseFloat(result.lat);
        const placeLng = parseFloat(result.lon);

        // Calculate distance and filter by radius
        const distance = this.calculateDistance(latitude, longitude, placeLat, placeLng);
        if (distance > radiusKm) {
          continue;
        }

        const addressData = result.address
          ? {
              ...(result.address.road && { road: result.address.road }),
              ...(result.address.house_number && { house_number: result.address.house_number }),
              ...((result.address.city || result.address.town || result.address.village) && {
                city: result.address.city || result.address.town || result.address.village,
              }),
              ...(result.address.state && { state: result.address.state }),
              ...(result.address.postcode && { postcode: result.address.postcode }),
              ...(result.address.country && { country: result.address.country }),
            }
          : undefined;

        places.push({
          placeId: result.place_id?.toString() || result.osm_id?.toString() || '',
          name: result.display_name.split(',')[0] || result.name || 'Unknown',
          latitude: placeLat,
          longitude: placeLng,
          displayName: result.display_name,
          ...(addressData && Object.keys(addressData).length > 0 && { address: addressData }),
          ...(result.type && { type: result.type }),
          ...(result.category && { category: result.category }),
        });
      }

      // Sort by distance
      places.sort((a, b) => {
        const distA = this.calculateDistance(latitude, longitude, a.latitude, a.longitude);
        const distB = this.calculateDistance(latitude, longitude, b.latitude, b.longitude);
        return distA - distB;
      });

      return places;
    } catch (error) {
      this.logger.error(`Error searching places: ${query}`, error);
      throw new Error(`Place search failed for query: ${query}`);
    }
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * @param lat1 Latitude of first point
   * @param lon1 Longitude of first point
   * @param lat2 Latitude of second point
   * @param lon2 Longitude of second point
   * @returns Distance in kilometers
   */
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Clear the geocoding cache
   */
  clearCache(): void {
    this.cache.clear();
    this.logger.debug('Geocoding cache cleared');
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.cache.size;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
