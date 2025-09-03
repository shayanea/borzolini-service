import * as XLSX from 'xlsx';

import { Injectable } from '@nestjs/common';
import { Response } from 'express';

export interface ExportOptions {
  format: 'csv' | 'excel';
  filename?: string;
  includeHeaders?: boolean;
}

export interface ExportData {
  [key: string]: any;
}

@Injectable()
export class ExportService {
  /**
   * Export data to CSV format
   */
  async exportToCsv(data: ExportData[], filename: string, res: Response, _options: Partial<ExportOptions> = {}): Promise<void> {
    if (!data || data.length === 0) {
      res.status(404).json({ message: 'No data to export' });
      return;
    }

    const first = (data[0] || {}) as Record<string, unknown>;
    const headers = Object.keys(first);
    const escapeCsv = (value: unknown): string => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      const needsQuoting = /[",\n]/.test(str);
      const escaped = str.replace(/"/g, '""');
      return needsQuoting ? `"${escaped}"` : escaped;
    };
    const headerLine = headers.map((h) => escapeCsv(this.formatHeader(h))).join(',');
    const lines = data.map((row) => headers.map((h) => escapeCsv((row as Record<string, unknown>)[h])).join(','));
    const csvContent = [headerLine, ...lines].join('\n');

    try {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csvContent);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: 'Error generating CSV export', error: err.message });
    }
  }

  /**
   * Export data to Excel format
   */
  async exportToExcel(data: ExportData[], filename: string, res: Response, _options: Partial<ExportOptions> = {}): Promise<void> {
    if (!data || data.length === 0) {
      res.status(404).json({ message: 'No data to export' });
      return;
    }

    try {
      // Create a new workbook
      const workbook = XLSX.utils.book_new();

      // Convert data to worksheet
      const worksheet = XLSX.utils.json_to_sheet(data);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

      // Generate Excel buffer
      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(excelBuffer);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: 'Error generating Excel export', error: err.message });
    }
  }

  /**
   * Export data in the specified format
   */
  async exportData(data: ExportData[], format: 'csv' | 'excel', entityType: string, res: Response, _options: Partial<ExportOptions> = {}): Promise<void> {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${entityType}_export_${timestamp}.${format === 'csv' ? 'csv' : 'xlsx'}`;

    if (format === 'csv') {
      await this.exportToCsv(data, filename, res, _options);
    } else {
      await this.exportToExcel(data, filename, res, _options);
    }
  }

  /**
   * Format header names for better readability
   */
  private formatHeader(header: string): string {
    return header.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }

  /**
   * Transform clinic data for export
   */
  transformClinicData(clinics: any[]): ExportData[] {
    return clinics.map((clinic) => ({
      id: clinic.id,
      name: clinic.name,
      description: clinic.description,
      address: clinic.address,
      city: clinic.city,
      state: clinic.state,
      zip_code: clinic.zip_code,
      phone: clinic.phone,
      email: clinic.email,
      website: clinic.website,
      rating: clinic.rating,
      is_verified: clinic.is_verified,
      is_active: clinic.is_active,
      services: clinic.services?.map((s: any) => s.name).join(', ') || '',
      specializations: clinic.specializations?.join(', ') || '',
      created_at: clinic.created_at,
      updated_at: clinic.updated_at,
    }));
  }

  /**
   * Transform user data for export
   */
  transformUserData(users: any[]): ExportData[] {
    return users.map((user) => ({
      id: user.id,
      email: user.email,
      first_name: user.firstName,
      last_name: user.lastName,
      phone: user.phone,
      role: user.role,
      is_active: user.isActive,
      is_phone_verified: user.isPhoneVerified,
      profile_completion_percentage: user.profileCompletionPercentage,
      date_of_birth: user.dateOfBirth,
      gender: user.gender,
      address: user.address,
      city: user.city,
      state: user.state,
      zip_code: user.zipCode,
      emergency_contact_name: user.emergencyContactName,
      emergency_contact_phone: user.emergencyContactPhone,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    }));
  }

  /**
   * Transform pet data for export
   */
  transformPetData(pets: any[]): ExportData[] {
    return pets.map((pet) => ({
      id: pet.id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      gender: pet.gender,
      date_of_birth: pet.dateOfBirth,
      age: pet.age,
      age_in_months: pet.ageInMonths,
      weight: pet.weight,
      size: pet.size,
      color: pet.color,
      is_spayed_neutered: pet.isSpayedNeutered,
      is_vaccinated: pet.isVaccinated,
      medical_history: pet.medicalHistory,
      owner_id: pet.owner_id,
      owner_name: `${pet.owner?.firstName} ${pet.owner?.lastName}` || '',
      owner_email: pet.owner?.email || '',
      created_at: pet.created_at,
      updated_at: pet.updated_at,
    }));
  }

  /**
   * Transform appointment data for export
   */
  transformAppointmentData(appointments: any[]): ExportData[] {
    return appointments.map((appointment) => ({
      id: appointment.id,
      scheduled_date: appointment.scheduled_date,
      duration_minutes: appointment.duration_minutes,
      status: appointment.status,
      type: appointment.type,
      priority: appointment.priority,
      notes: appointment.notes,
      is_telemedicine: appointment.is_telemedicine,
      home_visit_address: appointment.home_visit_address,
      pet_id: appointment.pet_id,
      pet_name: appointment.pet?.name || '',
      pet_species: appointment.pet?.species || '',
      owner_id: appointment.owner_id,
      owner_name: `${appointment.owner?.firstName} ${appointment.owner?.lastName}` || '',
      owner_email: appointment.owner?.email || '',
      clinic_id: appointment.clinic_id,
      clinic_name: appointment.clinic?.name || '',
      staff_id: appointment.staff_id,
      staff_name: `${appointment.staff?.user?.firstName} ${appointment.staff?.user?.lastName}` || '',
      created_at: appointment.created_at,
      updated_at: appointment.updated_at,
    }));
  }
}
