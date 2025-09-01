import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

/**
 * Interface for permission check options
 */
export interface PermissionCheckOptions {
  userId: string;
  userRole: string;
  ownerId?: string;
  allowedRoles?: string[];
  resourceName?: string;
}

/**
 * Interface for status change options
 */
export interface StatusChangeOptions<T> {
  entity: T;
  currentStatus: boolean;
  targetStatus: boolean;
  statusField: keyof T;
  conflictMessage: string;
  activityType?: string;
  activityData?: Record<string, any>;
}

/**
 * Utility functions for common validation patterns
 */
export class ValidationUtils {
  /**
   * Checks if user has permission to access a resource
   * @param options - Permission check options
   * @throws BadRequestException if permission denied
   */
  static checkPermission(options: PermissionCheckOptions): void {
    const { userId, userRole, ownerId, allowedRoles = ['admin'], resourceName = 'resource' } = options;

    // Admin and other allowed roles can access anything
    if (allowedRoles.includes(userRole)) {
      return;
    }

    // Check if user owns the resource
    if (ownerId && ownerId !== userId) {
      throw new BadRequestException(`You can only access your own ${resourceName}`);
    }

    // If no ownerId provided and user is not in allowed roles
    if (!ownerId && !allowedRoles.includes(userRole)) {
      throw new BadRequestException(`Access denied to ${resourceName}`);
    }
  }

  /**
   * Validates that an entity exists
   * @param entity - Entity to validate
   * @param entityName - Name of the entity for error message
   * @param entityId - ID of the entity for error message
   * @throws NotFoundException if entity doesn't exist
   */
  static validateEntityExists<T>(entity: T | null | undefined, entityName: string, entityId: string): asserts entity is T {
    if (!entity) {
      throw new NotFoundException(`${entityName} with ID ${entityId} not found`);
    }
  }

  /**
   * Validates that a status change is valid
   * @param options - Status change options
   * @throws ConflictException if status change is invalid
   */
  static validateStatusChange<T>(options: StatusChangeOptions<T>): void {
    const { currentStatus, targetStatus, conflictMessage } = options;

    if (currentStatus === targetStatus) {
      throw new ConflictException(conflictMessage);
    }
  }

  /**
   * Validates that a required field is not empty
   * @param value - Value to validate
   * @param fieldName - Name of the field for error message
   * @throws BadRequestException if value is empty
   */
  static validateRequiredField(value: any, fieldName: string): void {
    if (value === null || value === undefined || value === '') {
      throw new BadRequestException(`${fieldName} is required`);
    }
  }

  /**
   * Validates that a string is not empty and has minimum length
   * @param value - String to validate
   * @param fieldName - Name of the field for error message
   * @param minLength - Minimum length required
   * @throws BadRequestException if validation fails
   */
  static validateStringLength(value: string, fieldName: string, minLength: number = 1): void {
    if (!value || value.trim().length < minLength) {
      throw new BadRequestException(`${fieldName} must be at least ${minLength} characters long`);
    }
  }

  /**
   * Validates that a number is within a valid range
   * @param value - Number to validate
   * @param fieldName - Name of the field for error message
   * @param min - Minimum value
   * @param max - Maximum value
   * @throws BadRequestException if validation fails
   */
  static validateNumberRange(value: number, fieldName: string, min: number, max: number): void {
    if (value < min || value > max) {
      throw new BadRequestException(`${fieldName} must be between ${min} and ${max}`);
    }
  }

  /**
   * Validates that a date is in the future
   * @param date - Date to validate
   * @param fieldName - Name of the field for error message
   * @throws BadRequestException if date is not in the future
   */
  static validateFutureDate(date: Date, fieldName: string): void {
    const now = new Date();
    if (date <= now) {
      throw new BadRequestException(`${fieldName} must be in the future`);
    }
  }

  /**
   * Validates that a date is in the past
   * @param date - Date to validate
   * @param fieldName - Name of the field for error message
   * @throws BadRequestException if date is not in the past
   */
  static validatePastDate(date: Date, fieldName: string): void {
    const now = new Date();
    if (date >= now) {
      throw new BadRequestException(`${fieldName} must be in the past`);
    }
  }
}
