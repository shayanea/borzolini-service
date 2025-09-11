import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactResponseDto } from './dto/contact-response.dto';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { Contact } from './entities/contact.entity';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>
  ) {}

  async createContact(createContactDto: CreateContactDto): Promise<ContactResponseDto> {
    try {
      const contact = this.contactRepository.create({
        ...createContactDto,
        status: 'pending',
      });

      const savedContact = await this.contactRepository.save(contact);

      this.logger.log(`New contact form submission: ${savedContact.id} from ${savedContact.email}`);

      return this.mapToResponseDto(savedContact);
    } catch (error) {
      this.logger.error('Error creating contact submission:', error);
      throw error;
    }
  }

  async findAllContacts(): Promise<ContactResponseDto[]> {
    try {
      const contacts = await this.contactRepository.find({
        order: { createdAt: 'DESC' },
      });

      return contacts.map((contact) => this.mapToResponseDto(contact));
    } catch (error) {
      this.logger.error('Error fetching contacts:', error);
      throw error;
    }
  }

  async findContactById(id: string): Promise<ContactResponseDto> {
    try {
      const contact = await this.contactRepository.findOne({
        where: { id },
      });

      if (!contact) {
        throw new Error('Contact not found');
      }

      return this.mapToResponseDto(contact);
    } catch (error) {
      this.logger.error(`Error fetching contact ${id}:`, error);
      throw error;
    }
  }

  async updateContact(id: string, updateContactDto: UpdateContactDto): Promise<ContactResponseDto> {
    try {
      const contact = await this.contactRepository.findOne({
        where: { id },
      });

      if (!contact) {
        throw new Error('Contact not found');
      }

      Object.assign(contact, updateContactDto);
      const updatedContact = await this.contactRepository.save(contact);

      this.logger.log(`Contact ${id} updated with status: ${updatedContact.status}`);

      return this.mapToResponseDto(updatedContact);
    } catch (error) {
      this.logger.error(`Error updating contact ${id}:`, error);
      throw error;
    }
  }

  async deleteContact(id: string): Promise<void> {
    try {
      const result = await this.contactRepository.delete(id);

      if (result.affected === 0) {
        throw new Error('Contact not found');
      }

      this.logger.log(`Contact ${id} deleted`);
    } catch (error) {
      this.logger.error(`Error deleting contact ${id}:`, error);
      throw error;
    }
  }

  async getContactStats(): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    resolved: number;
    closed: number;
  }> {
    try {
      const [total, pending, inProgress, resolved, closed] = await Promise.all([
        this.contactRepository.count(),
        this.contactRepository.count({ where: { status: 'pending' } }),
        this.contactRepository.count({ where: { status: 'in_progress' } }),
        this.contactRepository.count({ where: { status: 'resolved' } }),
        this.contactRepository.count({ where: { status: 'closed' } }),
      ]);

      return {
        total,
        pending,
        inProgress,
        resolved,
        closed,
      };
    } catch (error) {
      this.logger.error('Error fetching contact stats:', error);
      throw error;
    }
  }

  private mapToResponseDto(contact: Contact): ContactResponseDto {
    const dto = new ContactResponseDto();
    dto.id = contact.id;
    dto.name = contact.name;
    dto.email = contact.email;
    dto.subject = contact.subject;
    dto.message = contact.message;
    dto.consent = contact.consent;
    dto.status = contact.status;
    dto.adminNotes = contact.adminNotes;
    dto.ipAddress = contact.ipAddress;
    dto.userAgent = contact.userAgent;
    dto.createdAt = contact.createdAt;
    dto.updatedAt = contact.updatedAt;
    return dto;
  }

  async findAllContactsPaginated(page: number, limit: number, filters: any) {
    try {
      const queryBuilder = this.contactRepository.createQueryBuilder('contact');

      // Apply filters
      if (filters.status) {
        queryBuilder.andWhere('contact.status = :status', { status: filters.status });
      }

      if (filters.search) {
        queryBuilder.andWhere(
          '(contact.name ILIKE :search OR contact.email ILIKE :search OR contact.subject ILIKE :search OR contact.message ILIKE :search)',
          { search: `%${filters.search}%` }
        );
      }

      if (filters.dateFrom) {
        queryBuilder.andWhere('contact.createdAt >= :dateFrom', { dateFrom: filters.dateFrom });
      }

      if (filters.dateTo) {
        queryBuilder.andWhere('contact.createdAt <= :dateTo', { dateTo: filters.dateTo });
      }

      // Apply pagination
      const skip = (page - 1) * limit;
      queryBuilder.skip(skip).take(limit);

      // Order by creation date (newest first)
      queryBuilder.orderBy('contact.createdAt', 'DESC');

      const [contacts, total] = await queryBuilder.getManyAndCount();

      return {
        data: contacts.map(contact => this.mapToResponseDto(contact)),
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error('Error fetching paginated contacts:', error);
      throw error;
    }
  }

  async exportContacts(filters: any) {
    try {
      const queryBuilder = this.contactRepository.createQueryBuilder('contact');

      // Apply filters
      if (filters.status) {
        queryBuilder.andWhere('contact.status = :status', { status: filters.status });
      }

      if (filters.search) {
        queryBuilder.andWhere(
          '(contact.name ILIKE :search OR contact.email ILIKE :search OR contact.subject ILIKE :search OR contact.message ILIKE :search)',
          { search: `%${filters.search}%` }
        );
      }

      if (filters.dateFrom) {
        queryBuilder.andWhere('contact.createdAt >= :dateFrom', { dateFrom: filters.dateFrom });
      }

      if (filters.dateTo) {
        queryBuilder.andWhere('contact.createdAt <= :dateTo', { dateTo: filters.dateTo });
      }

      queryBuilder.orderBy('contact.createdAt', 'DESC');

      const contacts = await queryBuilder.getMany();

      // Convert to CSV format
      const csvHeader = 'ID,Name,Email,Subject,Message,Status,Admin Notes,IP Address,User Agent,Created At,Updated At\n';
      const csvRows = contacts.map(contact => 
        `"${contact.id}","${contact.name}","${contact.email}","${contact.subject}","${contact.message.replace(/"/g, '""')}","${contact.status}","${contact.adminNotes || ''}","${contact.ipAddress || ''}","${contact.userAgent || ''}","${contact.createdAt.toISOString()}","${contact.updatedAt.toISOString()}"`
      ).join('\n');

      return csvHeader + csvRows;
    } catch (error) {
      this.logger.error('Error exporting contacts:', error);
      throw error;
    }
  }
}
