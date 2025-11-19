import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ClinicFinderService } from './clinic-finder.service';
import { FindClinicDto } from './dto/find-clinic.dto';
import { FindClinicResponseDto } from './dto/clinic-with-distance.dto';

@ApiTags('Clinic Finder')
@Controller('clinic-finder')
export class ClinicFinderController {
  constructor(private readonly clinicFinderService: ClinicFinderService) {}

  @Get('nearby')
  @ApiOperation({
    summary: 'Find nearby clinics based on user location and service type',
    description:
      'Searches for clinics/stores near the user location that offer the requested service type (grooming, check, shop, etc.)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of nearby clinics with distances',
    type: FindClinicResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request parameters',
  })
  async findNearbyClinics(@Query() findDto: FindClinicDto): Promise<FindClinicResponseDto> {
    return await this.clinicFinderService.findNearbyClinics(findDto);
  }

  @Get('best')
  @ApiOperation({
    summary: 'Find the best (closest) clinic for the requested service type',
    description:
      'Returns the single closest clinic that offers the requested service type near the user location',
  })
  @ApiResponse({
    status: 200,
    description: 'Best clinic found',
    type: FindClinicResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'No clinic found matching the criteria',
  })
  async findBestClinic(@Query() findDto: FindClinicDto): Promise<FindClinicResponseDto | null> {
    const clinic = await this.clinicFinderService.findBestClinic(findDto);
    if (!clinic) {
      return {
        clinics: [],
        total: 0,
        radiusKm: findDto.radiusKm || 10,
        serviceType: findDto.serviceType,
      };
    }
    return {
      clinics: [clinic],
      total: 1,
      radiusKm: findDto.radiusKm || 10,
      serviceType: findDto.serviceType,
    };
  }
}

