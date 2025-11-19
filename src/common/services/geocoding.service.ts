import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  displayName?: string;
}

export interface ReverseGeocodeResult {
  address: string;
  displayName: string;
}

@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);
  private readonly httpClient: AxiosInstance;
  private readonly baseUrl = 'https://nominatim.openstreetmap.org';
  private readonly cache = new Map<string, GeocodeResult>();
  private readonly rateLimitDelay = 1000; // 1 second delay between requests (Nominatim requires max 1 req/sec)

  constructor() {
    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        'User-Agent': 'Borzolini-Service/1.0 (pet clinic management platform)',
      },
    });
  }

  /**
   * Geocode an address to get latitude and longitude coordinates
   * @param address Full address string
   * @param city Optional city name
   * @param state Optional state/province
   * @param postalCode Optional postal code
   * @returns Promise with latitude and longitude
   */
  async geocodeAddress(
    address: string,
    city?: string,
    state?: string,
    postalCode?: string,
  ): Promise<GeocodeResult> {
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

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

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

