import { FindManyOptions, FindOptionsOrder, ObjectLiteral, Repository } from 'typeorm';

import { DateUtils } from './date.utils';

/**
 * Interface for common query filters
 */
export interface BaseQueryFilters {
  date?: Date;
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
}

/**
 * Interface for pagination options
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
}

/**
 * Interface for paginated result
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Utility functions for common database queries
 */
export class QueryUtils {
  /**
   * Creates a base where condition with optional date filter
   * @param baseWhere - Base where conditions
   * @param dateField - Field name for date filtering
   * @param date - Optional date to filter by
   * @returns Where condition object
   */
  static createWhereCondition<T extends Record<string, unknown>>(baseWhere: T, dateField: string = 'scheduled_date', date?: Date): T & { [key: string]: unknown } {
    const where: T & { [key: string]: unknown } = { ...baseWhere };

    if (date) {
      (where as Record<string, unknown>)[dateField] = DateUtils.createDayBetweenCondition(date);
    }

    return where;
  }

  /**
   * Creates find options with common patterns
   * @param where - Where conditions
   * @param relations - Relations to include
   * @param orderBy - Field to order by
   * @param orderDirection - Order direction
   * @returns FindManyOptions object
   */
  static createFindOptions<T>(where: any, relations: string[] = [], orderBy: string = 'created_at', orderDirection: 'ASC' | 'DESC' = 'ASC'): FindManyOptions<T> {
    return {
      where,
      relations,
      order: { [orderBy]: orderDirection } as FindOptionsOrder<T>,
    };
  }

  /**
   * Creates paginated find options
   * @param where - Where conditions
   * @param relations - Relations to include
   * @param orderBy - Field to order by
   * @param orderDirection - Order direction
   * @param page - Page number (1-based)
   * @param limit - Items per page
   * @returns FindManyOptions with pagination
   */
  static createPaginatedFindOptions<T>(where: any, relations: string[] = [], orderBy: string = 'created_at', orderDirection: 'ASC' | 'DESC' = 'ASC', page: number = 1, limit: number = 10): FindManyOptions<T> {
    const offset = (page - 1) * limit;

    return {
      where,
      relations,
      order: { [orderBy]: orderDirection } as FindOptionsOrder<T>,
      skip: offset,
      take: limit,
    };
  }

  /**
   * Executes a paginated query and returns formatted result
   * @param repository - TypeORM repository
   * @param findOptions - Find options
   * @param page - Page number
   * @param limit - Items per page
   * @returns Paginated result
   */
  static async executePaginatedQuery<T extends ObjectLiteral>(repository: Repository<T>, findOptions: FindManyOptions<T>, page: number = 1, limit: number = 10): Promise<PaginatedResult<T>> {
    const [data, total] = await repository.findAndCount(findOptions);
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      totalPages,
    };
  }

  /**
   * Validates and normalizes pagination parameters
   * @param page - Page number
   * @param limit - Items per page
   * @param maxLimit - Maximum allowed limit
   * @returns Normalized pagination parameters
   */
  static normalizePagination(page?: number, limit?: number, maxLimit: number = 100): { page: number; limit: number } {
    const normalizedPage = Math.max(1, page || 1);
    const normalizedLimit = Math.min(maxLimit, Math.max(1, limit || 10));

    return {
      page: normalizedPage,
      limit: normalizedLimit,
    };
  }
}
