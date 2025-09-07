import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserRole } from '../../users/entities/user.entity';
import { ClinicStaff, StaffRole } from '../../clinics/entities/clinic-staff.entity';
import { REQUIRED_STAFF_ROLES_KEY } from '../decorators/required-staff-roles.decorator';

@Injectable()
export class ClinicAccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(ClinicStaff)
    private clinicStaffRepository: Repository<ClinicStaff>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    this.validateUser(user);

    if (this.isGlobalAdmin(user)) {
      return true;
    }

    const clinicId = this.extractClinicId(request);
    if (!clinicId) {
      return true;
    }

    const staffMembership = await this.validateStaffMembership(user.id, clinicId);
    this.validateStaffRoles(context, staffMembership);

    request.staffMembership = staffMembership;
    return true;
  }

  private validateUser(user: any): void {
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }
  }

  private isGlobalAdmin(user: any): boolean {
    return user.role === UserRole.ADMIN;
  }

  private extractClinicId(request: any): string | null {
    return request.params.clinicId || null;
  }

  private async validateStaffMembership(userId: string, clinicId: string): Promise<ClinicStaff> {
    const staffMembership = await this.clinicStaffRepository.findOne({
      where: {
        user_id: userId,
        clinic_id: clinicId,
        is_active: true,
      },
    });

    if (!staffMembership) {
      throw new ForbiddenException('Access denied: You are not a member of this clinic');
    }

    return staffMembership;
  }

  private validateStaffRoles(context: ExecutionContext, staffMembership: ClinicStaff): void {
    const requiredStaffRoles = this.reflector.getAllAndOverride<StaffRole[]>(REQUIRED_STAFF_ROLES_KEY, [context.getHandler(), context.getClass()]);

    if (requiredStaffRoles && requiredStaffRoles.length > 0) {
      const hasRequiredRole = requiredStaffRoles.includes(staffMembership.role);
      if (!hasRequiredRole) {
        throw new ForbiddenException(`Access denied: Required staff role(s): ${requiredStaffRoles.join(', ')}. Your role: ${staffMembership.role}`);
      }
    }
  }
}
