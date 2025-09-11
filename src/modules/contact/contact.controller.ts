import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { ContactService } from './contact.service';
import { ContactResponseDto } from './dto/contact-response.dto';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@ApiTags('contact')
@Controller('contact')
@UseGuards(ThrottlerGuard)
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @ApiOperation({
    summary: 'Submit contact form',
    description: 'Submit a new contact form inquiry. This endpoint is rate-limited for security.',
  })
  @ApiResponse({
    status: 201,
    description: 'Contact form submitted successfully',
    type: ContactResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests',
  })
  async createContact(@Body() createContactDto: CreateContactDto, @Req() request: any): Promise<ContactResponseDto> {
    // Extract IP address and user agent for security tracking
    const ipAddress = request.ip || request.connection?.remoteAddress || 'unknown';
    const userAgent = request.headers['user-agent'] || 'unknown';

    const contactData = {
      ...createContactDto,
      ipAddress,
      userAgent,
    };

    return this.contactService.createContact(contactData);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all contact submissions',
    description: 'Retrieve all contact form submissions. Requires admin or staff role.',
  })
  @ApiResponse({
    status: 200,
    description: 'Contact submissions retrieved successfully',
    type: [ContactResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async findAllContacts(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const filters = {
      status,
      search,
      dateFrom,
      dateTo,
    };
    return this.contactService.findAllContactsPaginated(page, limit, filters);
  }

  @Get('export')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Export contact submissions',
    description: 'Export contact form submissions to CSV. Requires admin or staff role.'
  })
  @ApiResponse({
    status: 200,
    description: 'Contact submissions exported successfully',
    content: {
      'text/csv': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async exportContacts(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const filters = {
      status,
      search,
      dateFrom,
      dateTo,
    };
    return this.contactService.exportContacts(filters);
  }

  async findAllContactsOld(): Promise<ContactResponseDto[]> {    return this.contactService.findAllContacts();
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get contact statistics',
    description: 'Get statistics about contact form submissions. Requires admin or staff role.',
  })
  @ApiResponse({
    status: 200,
    description: 'Contact statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        pending: { type: 'number' },
        inProgress: { type: 'number' },
        resolved: { type: 'number' },
        closed: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async getContactStats() {
    return this.contactService.getContactStats();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get contact by ID',
    description: 'Retrieve a specific contact submission by ID. Requires admin or staff role.',
  })
  @ApiResponse({
    status: 200,
    description: 'Contact submission retrieved successfully',
    type: ContactResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Contact not found',
  })
  async findContactById(@Param('id') id: string): Promise<ContactResponseDto> {
    return this.contactService.findContactById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update contact status',
    description: 'Update the status and admin notes of a contact submission. Requires admin or staff role.',
  })
  @ApiResponse({
    status: 200,
    description: 'Contact submission updated successfully',
    type: ContactResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Contact not found',
  })
  async updateContact(@Param('id') id: string, @Body() updateContactDto: UpdateContactDto): Promise<ContactResponseDto> {
    return this.contactService.updateContact(id, updateContactDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete contact submission',
    description: 'Delete a contact submission. Requires admin role.',
  })
  @ApiResponse({
    status: 200,
    description: 'Contact submission deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Contact not found',
  })
  async deleteContact(@Param('id') id: string): Promise<{ message: string }> {
    await this.contactService.deleteContact(id);
    return { message: 'Contact submission deleted successfully' };
  }
}
