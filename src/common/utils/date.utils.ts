import { Between } from 'typeorm';

/**
 * Utility functions for date operations
 */
export class DateUtils {
  /**
   * Creates a date range for a specific day (start and end of day)
   * @param date - The date to create range for
   * @returns Object with startOfDay and endOfDay dates
   */
  static createDayRange(date: Date): { startOfDay: Date; endOfDay: Date } {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return { startOfDay, endOfDay };
  }

  /**
   * Creates a TypeORM Between condition for a specific day
   * @param date - The date to create condition for
   * @returns TypeORM Between condition
   */
  static createDayBetweenCondition(date: Date) {
    const { startOfDay, endOfDay } = this.createDayRange(date);
    return Between(startOfDay, endOfDay);
  }

  /**
   * Converts a string date to Date object with validation
   * @param dateString - String representation of date
   * @returns Date object or null if invalid
   */
  static parseDate(dateString: string): Date | null {
    if (!dateString) return null;

    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  }

  /**
   * Formats date for logging purposes
   * @param date - Date to format
   * @returns Formatted date string
   */
  static formatForLogging(date: Date): string {
    return date.toISOString();
  }
}
