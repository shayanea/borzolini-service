import { SetMetadata } from '@nestjs/common';
import { StaffRole } from '../../clinics/entities/clinic-staff.entity';

export const REQUIRED_STAFF_ROLES_KEY = 'requiredStaffRoles';
export const RequiredStaffRoles = (...roles: StaffRole[]) => SetMetadata(REQUIRED_STAFF_ROLES_KEY, roles);
