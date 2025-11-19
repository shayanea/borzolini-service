import { ApiProperty } from '@nestjs/swagger';

export class ClinicWithDistanceDto {
  @ApiProperty({ description: 'Clinic ID' })
  id!: string;

  @ApiProperty({ description: 'Clinic name' })
  name!: string;

  @ApiProperty({ description: 'Clinic description', required: false })
  description?: string;

  @ApiProperty({ description: 'Full address' })
  address!: string;

  @ApiProperty({ description: 'City' })
  city!: string;

  @ApiProperty({ description: 'State/Province', required: false })
  state?: string;

  @ApiProperty({ description: 'Postal code', required: false })
  postal_code?: string;

  @ApiProperty({ description: 'Country' })
  country!: string;

  @ApiProperty({ description: 'Phone number', required: false })
  phone?: string;

  @ApiProperty({ description: 'Email address', required: false })
  email?: string;

  @ApiProperty({ description: 'Website URL', required: false })
  website?: string;

  @ApiProperty({ description: 'Logo URL', required: false })
  logo_url?: string;

  @ApiProperty({ description: 'Average rating' })
  rating!: number;

  @ApiProperty({ description: 'Total number of reviews' })
  total_reviews!: number;

  @ApiProperty({ description: 'Whether clinic is verified' })
  is_verified!: boolean;

  @ApiProperty({ description: 'List of services offered' })
  services!: string[];

  @ApiProperty({ description: 'List of specializations' })
  specializations!: string[];

  @ApiProperty({ description: 'Distance from user location in kilometers' })
  distanceKm!: number;

  @ApiProperty({ description: 'Latitude coordinate of clinic (geocoded)', required: false })
  latitude?: number;

  @ApiProperty({ description: 'Longitude coordinate of clinic (geocoded)', required: false })
  longitude?: number;
}

export class FindClinicResponseDto {
  @ApiProperty({ description: 'List of clinics found', type: [ClinicWithDistanceDto] })
  clinics!: ClinicWithDistanceDto[];

  @ApiProperty({ description: 'Total number of clinics found' })
  total!: number;

  @ApiProperty({ description: 'Search radius used in kilometers' })
  radiusKm!: number;

  @ApiProperty({ description: 'Service type searched' })
  serviceType!: string;
}

