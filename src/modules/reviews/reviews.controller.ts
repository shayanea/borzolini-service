import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { CreateAppointmentReviewDto } from './dto/create-appointment-review.dto';
import { ReviewsService } from './reviews.service';

@ApiTags('Reviews')
@Controller('reviews')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('appointments')
  @ApiOperation({ summary: 'Create a review for a completed appointment' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Review created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid review data or review already exists',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Appointment not found or not completed',
  })
  async createReview(@Body() createReviewDto: CreateAppointmentReviewDto, @Request() req: any) {
    return this.reviewsService.createReview(createReviewDto, req.user.id);
  }

  @Get('appointments/clinic/:clinicId')
  @ApiOperation({ summary: 'Get reviews for a specific clinic' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'approved', 'rejected', 'flagged'], description: 'Filter by review status' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reviews retrieved successfully',
  })
  async getReviewsByClinic(@Param('clinicId') clinicId: string, @Query('page') page: number = 1, @Query('limit') limit: number = 10, @Query('status') status?: string) {
    return this.reviewsService.getReviewsByClinic(clinicId, page, limit, status as any);
  }

  @Get('appointments/user')
  @ApiOperation({ summary: 'Get reviews by the current user' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User reviews retrieved successfully',
  })
  async getReviewsByUser(@Request() req: any, @Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.reviewsService.getReviewsByUser(req.user.id, page, limit);
  }

  @Get('appointments/:id')
  @ApiOperation({ summary: 'Get a specific review by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Review retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Review not found',
  })
  async getReviewById(@Param('id') id: string) {
    return this.reviewsService.getReviewById(id);
  }

  @Put('appointments/:id')
  @ApiOperation({ summary: 'Update a review' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Review updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Review not found or access denied',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot modify approved review',
  })
  async updateReview(@Param('id') id: string, @Body() updateData: Partial<CreateAppointmentReviewDto>, @Request() req: any) {
    return this.reviewsService.updateReview(id, updateData, req.user.id);
  }

  @Delete('appointments/:id')
  @ApiOperation({ summary: 'Delete a review' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Review deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Review not found or access denied',
  })
  async deleteReview(@Param('id') id: string, @Request() req: any) {
    await this.reviewsService.deleteReview(id, req.user.id);
    return { message: 'Review deleted successfully' };
  }

  @Get('appointments/clinic/:clinicId/statistics')
  @ApiOperation({ summary: 'Get review statistics for a clinic' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Clinic statistics retrieved successfully',
  })
  async getClinicStatistics(@Param('clinicId') clinicId: string) {
    return this.reviewsService.getClinicStatistics(clinicId);
  }

  @Post('appointments/:id/clinic-response')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CLINIC_ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Add clinic response to a review' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Clinic response added successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Review not found or access denied',
  })
  async addClinicResponse(@Param('id') id: string, @Body('response') response: string, @Request() req: any) {
    return this.reviewsService.addClinicResponse(id, response, req.user.clinic_id);
  }

  @Post('appointments/:id/helpful')
  @ApiOperation({ summary: 'Mark a review as helpful' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Review marked as helpful',
  })
  async markReviewHelpful(@Param('id') id: string, @Request() req: any) {
    await this.reviewsService.markReviewHelpful(id, req.user.id);
    return { message: 'Review marked as helpful' };
  }

  @Post('appointments/:id/report')
  @ApiOperation({ summary: 'Report a review' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Review reported successfully',
  })
  async reportReview(@Param('id') id: string, @Body('reason') reason: string, @Request() req: any) {
    await this.reviewsService.reportReview(id, reason, req.user.id);
    return { message: 'Review reported successfully' };
  }
}
