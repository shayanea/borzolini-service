import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateResourceDto } from './dto/create-resource.dto';
import { ResourceResponseDto } from './dto/resource-response.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { Resource, ResourceType } from './entities/resource.entity';

@Injectable()
export class ResourcesService {
  private readonly logger = new Logger(ResourcesService.name);

  constructor(
    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>
  ) {}

  /**
   * Create a new resource
   */
  async create(createResourceDto: CreateResourceDto): Promise<ResourceResponseDto> {
    this.logger.log(`Creating new resource: ${createResourceDto.title}`);

    const resource = this.resourceRepository.create({
      ...createResourceDto,
      is_active: createResourceDto.is_active ?? true,
    });

    const savedResource = await this.resourceRepository.save(resource);
    return this.mapToResponseDto(savedResource);
  }

  /**
   * Get all resources with optional filters
   */
  async findAll(type?: ResourceType, isActive?: boolean): Promise<ResourceResponseDto[]> {
    this.logger.log(`Fetching all resources - type: ${type || 'all'}, isActive: ${isActive !== undefined ? isActive : 'all'}`);

    const where: any = {};
    if (type) {
      where.type = type;
    }
    if (isActive !== undefined) {
      where.is_active = isActive;
    }

    const resources = await this.resourceRepository.find({
      where,
      order: { created_at: 'DESC' },
    });

    return resources.map((resource) => this.mapToResponseDto(resource));
  }

  /**
   * Get a resource by ID
   */
  async findOne(id: string): Promise<ResourceResponseDto> {
    this.logger.log(`Fetching resource with ID: ${id}`);

    const resource = await this.resourceRepository.findOne({
      where: { id },
    });

    if (!resource) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }

    return this.mapToResponseDto(resource);
  }

  /**
   * Update a resource
   */
  async update(id: string, updateResourceDto: UpdateResourceDto): Promise<ResourceResponseDto> {
    this.logger.log(`Updating resource with ID: ${id}`);

    const resource = await this.resourceRepository.findOne({
      where: { id },
    });

    if (!resource) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }

    Object.assign(resource, updateResourceDto);
    const updatedResource = await this.resourceRepository.save(resource);

    return this.mapToResponseDto(updatedResource);
  }

  /**
   * Delete a resource
   */
  async remove(id: string): Promise<void> {
    this.logger.log(`Deleting resource with ID: ${id}`);

    const resource = await this.resourceRepository.findOne({
      where: { id },
    });

    if (!resource) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }

    await this.resourceRepository.remove(resource);
  }

  /**
   * Get resources by type
   */
  async findByType(type: ResourceType, activeOnly: boolean = true): Promise<ResourceResponseDto[]> {
    this.logger.log(`Fetching resources by type: ${type}, activeOnly: ${activeOnly}`);

    const where: any = { type };
    if (activeOnly) {
      where.is_active = true;
    }

    const resources = await this.resourceRepository.find({
      where,
      order: { created_at: 'DESC' },
    });

    return resources.map((resource) => this.mapToResponseDto(resource));
  }

  /**
   * Get only active resources
   */
  async findActive(): Promise<ResourceResponseDto[]> {
    this.logger.log('Fetching active resources');

    const resources = await this.resourceRepository.find({
      where: { is_active: true },
      order: { created_at: 'DESC' },
    });

    return resources.map((resource) => this.mapToResponseDto(resource));
  }

  /**
   * Map entity to response DTO
   */
  private mapToResponseDto(resource: Resource): ResourceResponseDto {
    const dto: ResourceResponseDto = {
      id: resource.id,
      type: resource.type,
      title: resource.title,
      url: resource.url,
      is_active: resource.is_active,
      created_at: resource.created_at,
      updated_at: resource.updated_at,
    };
    if (resource.description !== undefined && resource.description !== null) {
      dto.description = resource.description;
    }
    if (resource.cover !== undefined && resource.cover !== null) {
      dto.cover = resource.cover;
    }
    return dto;
  }
}

