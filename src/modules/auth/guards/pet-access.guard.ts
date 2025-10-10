import { CanActivate, ExecutionContext, Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserRole } from '../../users/entities/user.entity';
import { ClinicStaff } from '../../clinics/entities/clinic-staff.entity';
import { Pet } from '../../pets/entities/pet.entity';
import { ClinicPetCase } from '../../clinics/entities/pet-case.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';

/**
 * PetAccessGuard ensures that users can only access pets that belong to them
 * or to their clinic (if they are staff/veterinarian).
 *
 * Authorization logic:
 * - Pet owners can always access their own pets
 * - Global admins can access any pet
 * - Veterinarians/Staff can only access pets that have:
 *   1. An active case at their clinic, OR
 *   2. An appointment at their clinic
 */
@Injectable()
export class PetAccessGuard implements CanActivate {
  constructor(
    @InjectRepository(Pet)
    private petRepository: Repository<Pet>,
    @InjectRepository(ClinicStaff)
    private clinicStaffRepository: Repository<ClinicStaff>,
    @InjectRepository(ClinicPetCase)
    private petCaseRepository: Repository<ClinicPetCase>,
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    this.validateAuthentication(user);

    // Global admins have access to all pets
    if (this.isGlobalAdmin(user)) {
      return true;
    }

    const petId = this.extractPetId(request);
    if (!petId) {
      // No pet ID in request, allow request to proceed
      return true;
    }

    const pet = await this.fetchPet(petId);

    // Pet owners can always access their own pets
    if (this.isPetOwner(pet, user)) {
      return true;
    }

    // For veterinarians and staff, check clinic association
    if (this.isClinicStaff(user)) {
      await this.validateStaffClinicAccess(user.id, petId);
      return true;
    }

    // Regular users can only access their own pets
    throw new ForbiddenException('Access denied: You can only access your own pets');
  }

  private validateAuthentication(user: any): void {
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }
  }

  private isGlobalAdmin(user: any): boolean {
    return user.role === UserRole.ADMIN;
  }

  private async fetchPet(petId: string): Promise<Pet> {
    const pet = await this.petRepository.findOne({
      where: { id: petId, is_active: true },
    });

    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    return pet;
  }

  private isPetOwner(pet: Pet, user: any): boolean {
    return pet.owner_id === user.id;
  }

  private isClinicStaff(user: any): boolean {
    return [UserRole.VETERINARIAN, UserRole.STAFF].includes(user.role);
  }

  private async validateStaffClinicAccess(userId: string, petId: string): Promise<void> {
    const hasClinicAccess = await this.validateClinicAccess(userId, petId);
    if (!hasClinicAccess) {
      throw new ForbiddenException('Access denied: This pet is not associated with your clinic');
    }
  }

  /**
   * Extract pet ID from request params or query
   */
  private extractPetId(request: any): string | null {
    return request.params.id || request.query.pet_id || null;
  }

  /**
   * Validates if a user has access to a pet through their clinic(s)
   */
  private async validateClinicAccess(userId: string, petId: string): Promise<boolean> {
    const clinicIds = await this.getUserClinicIds(userId);

    if (clinicIds.length === 0) {
      return false;
    }

    const hasPetCase = await this.checkPetCaseAccess(petId, clinicIds);
    if (hasPetCase) {
      return true;
    }

    const hasAppointment = await this.checkAppointmentAccess(petId, clinicIds);
    return hasAppointment;
  }

  /**
   * Get all clinic IDs where the user is active staff
   */
  private async getUserClinicIds(userId: string): Promise<string[]> {
    const staffMemberships = await this.clinicStaffRepository.find({
      where: {
        user_id: userId,
        is_active: true,
      },
    });

    return staffMemberships.map((membership) => membership.clinic_id);
  }

  /**
   * Check if pet has an active case at any of the user's clinics
   */
  private async checkPetCaseAccess(petId: string, clinicIds: string[]): Promise<boolean> {
    for (const clinicId of clinicIds) {
      const petCase = await this.petCaseRepository.findOne({
        where: {
          pet_id: petId,
          clinic_id: clinicId,
          is_active: true,
        },
      });

      if (petCase) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if pet has an active appointment at any of the user's clinics
   */
  private async checkAppointmentAccess(petId: string, clinicIds: string[]): Promise<boolean> {
    for (const clinicId of clinicIds) {
      const appointment = await this.appointmentRepository.findOne({
        where: {
          pet_id: petId,
          clinic_id: clinicId,
          is_active: true,
        },
      });

      if (appointment) {
        return true;
      }
    }

    return false;
  }
}
