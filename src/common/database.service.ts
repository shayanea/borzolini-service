import { Injectable } from '@nestjs/common';

@Injectable()
export class DatabaseService {
  /**
   * Generate a database-friendly slug
   */
  generateSlug(input: string): string {
    return input
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * Sanitize SQL input to prevent injection
   */
  sanitizeInput(input: string): string {
    return input
      .replace(/[;'"\\]/g, '')
      .replace(/--/g, '')
      .replace(/\/\*/g, '')
      .replace(/\*\//g, '');
  }

  /**
   * Format date for database storage
   */
  formatDateForDB(date: Date): string {
    return date.toISOString();
  }

  /**
   * Parse date from database
   */
  parseDateFromDB(dateString: string): Date {
    return new Date(dateString);
  }
}
