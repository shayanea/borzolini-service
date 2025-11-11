import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateWalkGroupDto } from './dto/create-walk-group.dto';
import { JoinWalkGroupByCodeDto, JoinWalkGroupDto } from './dto/join-walk-group.dto';
import { ParticipantResponseDto, WalkGroupResponseDto } from './dto/walk-group-response.dto';
import { UpdateWalkGroupDto } from './dto/update-walk-group.dto';
import { WalkGroupStatus } from './entities/walk-group.entity';
import { WalkGroupsService } from './walk-groups.service';

@ApiTags('Walk Groups')
@Controller('walk-groups')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WalkGroupsController {
  constructor(private readonly walkGroupsService: WalkGroupsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new walk group',
    description: 'Create a new walk group event with invite code and URL. The organizer\'s pet will be automatically added as the first participant.',
  })
  @ApiResponse({
    status: 201,
    description: 'Walk group created successfully',
    type: WalkGroupResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - invalid data or pet compatibility issues' })
  @ApiResponse({ status: 404, description: 'Pet not found' })
  async create(@Body() createWalkGroupDto: CreateWalkGroupDto, @Request() req: any): Promise<WalkGroupResponseDto> {
    return this.walkGroupsService.create(req.user.id, createWalkGroupDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all walk groups',
    description: 'Get all walk groups with optional filters (city, state, country, status, date range)',
  })
  @ApiResponse({
    status: 200,
    description: 'Walk groups retrieved successfully',
    type: [WalkGroupResponseDto],
  })
  @ApiQuery({
    name: 'city',
    required: false,
    type: String,
    description: 'Filter by city',
  })
  @ApiQuery({
    name: 'state',
    required: false,
    type: String,
    description: 'Filter by state/province',
  })
  @ApiQuery({
    name: 'country',
    required: false,
    type: String,
    description: 'Filter by country',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: WalkGroupStatus,
    description: 'Filter by status',
  })
  @ApiQuery({
    name: 'dateFrom',
    required: false,
    type: String,
    description: 'Filter by start date (ISO 8601)',
  })
  @ApiQuery({
    name: 'dateTo',
    required: false,
    type: String,
    description: 'Filter by end date (ISO 8601)',
  })
  async findAll(
    @Request() req: any,
    @Query('city') city?: string,
    @Query('state') state?: string,
    @Query('country') country?: string,
    @Query('status') status?: WalkGroupStatus,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ): Promise<WalkGroupResponseDto[]> {
    const filters: {
      city?: string;
      state?: string;
      country?: string;
      status?: WalkGroupStatus;
      dateFrom?: Date;
      dateTo?: Date;
    } = {};

    if (city) filters.city = city;
    if (state) filters.state = state;
    if (country) filters.country = country;
    if (status) filters.status = status;
    if (dateFrom) filters.dateFrom = new Date(dateFrom);
    if (dateTo) filters.dateTo = new Date(dateTo);

    return this.walkGroupsService.findAll(req.user.id, filters);
  }

  @Get('my-groups')
  @ApiOperation({
    summary: 'Get user\'s walk groups',
    description: 'Get walk groups organized by the user and walk groups the user has joined',
  })
  @ApiResponse({
    status: 200,
    description: 'User\'s walk groups retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        organized: {
          type: 'array',
          items: { $ref: '#/components/schemas/WalkGroupResponseDto' },
        },
        joined: {
          type: 'array',
          items: { $ref: '#/components/schemas/WalkGroupResponseDto' },
        },
      },
    },
  })
  async getMyGroups(@Request() req: any): Promise<{ organized: WalkGroupResponseDto[]; joined: WalkGroupResponseDto[] }> {
    return this.walkGroupsService.getMyGroups(req.user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a walk group by ID',
    description: 'Get detailed information about a specific walk group including participants',
  })
  @ApiParam({ name: 'id', description: 'Walk group ID' })
  @ApiResponse({
    status: 200,
    description: 'Walk group retrieved successfully',
    type: WalkGroupResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Walk group not found' })
  async findOne(@Param('id') id: string, @Request() req: any): Promise<WalkGroupResponseDto> {
    return this.walkGroupsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a walk group',
    description: 'Update a walk group (organizer only). Cannot update completed walk groups.',
  })
  @ApiParam({ name: 'id', description: 'Walk group ID' })
  @ApiResponse({
    status: 200,
    description: 'Walk group updated successfully',
    type: WalkGroupResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - only organizer can update' })
  @ApiResponse({ status: 404, description: 'Walk group not found' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid data or compatibility issues' })
  async update(
    @Param('id') id: string,
    @Body() updateWalkGroupDto: UpdateWalkGroupDto,
    @Request() req: any,
  ): Promise<WalkGroupResponseDto> {
    return this.walkGroupsService.update(id, req.user.id, updateWalkGroupDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Cancel a walk group',
    description: 'Cancel a walk group (organizer only). This will set the status to cancelled and mark it as inactive.',
  })
  @ApiParam({ name: 'id', description: 'Walk group ID' })
  @ApiResponse({ status: 204, description: 'Walk group cancelled successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - only organizer can cancel' })
  @ApiResponse({ status: 404, description: 'Walk group not found' })
  async remove(@Param('id') id: string, @Request() req: any): Promise<void> {
    return this.walkGroupsService.remove(id, req.user.id);
  }

  @Post(':id/join')
  @ApiOperation({
    summary: 'Join a walk group',
    description: 'Join a walk group with a pet. Pet compatibility will be checked before joining.',
  })
  @ApiParam({ name: 'id', description: 'Walk group ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully joined the walk group',
    type: WalkGroupResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - compatibility issues, full group, or event started' })
  @ApiResponse({ status: 404, description: 'Walk group or pet not found' })
  @ApiResponse({ status: 409, description: 'Conflict - pet already a participant' })
  async join(@Param('id') id: string, @Body() joinDto: JoinWalkGroupDto, @Request() req: any): Promise<WalkGroupResponseDto> {
    return this.walkGroupsService.join(id, req.user.id, joinDto);
  }

  @Post('join-by-code')
  @ApiOperation({
    summary: 'Join a walk group using invite code',
    description: 'Join a walk group using an invite code. Pet compatibility will be checked before joining.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully joined the walk group',
    type: WalkGroupResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - compatibility issues, full group, or event started' })
  @ApiResponse({ status: 404, description: 'Walk group not found with the provided invite code' })
  @ApiResponse({ status: 409, description: 'Conflict - pet already a participant' })
  async joinByCode(@Body() joinByCodeDto: JoinWalkGroupByCodeDto, @Request() req: any): Promise<WalkGroupResponseDto> {
    return this.walkGroupsService.joinByCode(req.user.id, joinByCodeDto);
  }

  @Delete(':id/leave')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Leave a walk group',
    description: 'Leave a walk group. Organizers cannot leave (they must cancel the group instead).',
  })
  @ApiParam({ name: 'id', description: 'Walk group ID' })
  @ApiQuery({ name: 'petId', required: true, type: String, description: 'Pet ID to remove from the walk group' })
  @ApiResponse({ status: 204, description: 'Successfully left the walk group' })
  @ApiResponse({ status: 400, description: 'Bad request - organizer cannot leave' })
  @ApiResponse({ status: 404, description: 'Walk group or participant not found' })
  async leave(@Param('id') id: string, @Query('petId') petId: string, @Request() req: any): Promise<void> {
    return this.walkGroupsService.leave(id, req.user.id, petId);
  }

  @Get(':id/participants')
  @ApiOperation({
    summary: 'Get walk group participants',
    description: 'Get list of participants in a walk group (organizer and participants can view)',
  })
  @ApiParam({ name: 'id', description: 'Walk group ID' })
  @ApiResponse({
    status: 200,
    description: 'Participants retrieved successfully',
    type: [ParticipantResponseDto],
  })
  @ApiResponse({ status: 403, description: 'Forbidden - only organizer and participants can view' })
  @ApiResponse({ status: 404, description: 'Walk group not found' })
  async getParticipants(@Param('id') id: string, @Request() req: any): Promise<ParticipantResponseDto[]> {
    return this.walkGroupsService.getParticipants(id, req.user.id);
  }

  @Delete(':id/participants/:participantId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove a participant from walk group',
    description: 'Remove a participant from a walk group (organizer only)',
  })
  @ApiParam({ name: 'id', description: 'Walk group ID' })
  @ApiParam({ name: 'participantId', description: 'Participant ID' })
  @ApiResponse({ status: 204, description: 'Participant removed successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - only organizer can remove participants' })
  @ApiResponse({ status: 404, description: 'Walk group or participant not found' })
  async removeParticipant(
    @Param('id') id: string,
    @Param('participantId') participantId: string,
    @Request() req: any,
  ): Promise<void> {
    return this.walkGroupsService.removeParticipant(id, participantId, req.user.id);
  }
}

