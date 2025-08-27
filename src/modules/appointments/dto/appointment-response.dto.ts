import { ApiProperty } from '@nestjs/swagger';
import { Appointment, AppointmentType, AppointmentStatus, AppointmentPriority } from '../entities/appointment.entity';

export class AppointmentResponseDto {
  @ApiProperty({
    description: 'Appointment data',
    type: Appointment,
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      appointment_type: 'consultation',
      status: 'confirmed',
      priority: 'normal',
      scheduled_date: '2024-01-20T14:00:00.000Z',
      duration_minutes: 30,
      actual_start_time: null,
      actual_end_time: null,
      notes: 'Regular wellness check for healthy adult dog',
      reason: 'Annual wellness examination',
      symptoms: 'None reported',
      diagnosis: null,
      treatment_plan: null,
      prescriptions: [],
      follow_up_instructions: null,
      cost: 75.00,
      payment_status: 'pending',
      is_telemedicine: false,
      telemedicine_link: null,
      home_visit_address: null,
      is_home_visit: false,
      reminder_settings: {
        email_reminder: true,
        sms_reminder: false,
        push_reminder: true,
        reminder_hours_before: 24
      },
      is_active: true,
      created_at: '2024-01-15T10:30:00.000Z',
      updated_at: '2024-01-15T10:30:00.000Z',
      owner_id: '456e7890-e89b-12d3-a456-426614174001',
      pet_id: '789e0123-e89b-12d3-a456-426614174002',
      clinic_id: '012e3456-e89b-12d3-a456-426614174003',
      staff_id: '345e6789-e89b-12d3-a456-426614174004',
      service_id: '678e9012-e89b-12d3-a456-426614174005'
    }
  })
  data!: Appointment;

  @ApiProperty({
    description: 'Success message',
    example: 'Appointment retrieved successfully'
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp!: string;
}

export class AppointmentsListResponseDto {
  @ApiProperty({
    description: 'List of appointments',
    type: [Appointment],
    example: [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        appointment_type: 'consultation',
        status: 'confirmed',
        priority: 'normal',
        scheduled_date: '2024-01-20T14:00:00.000Z',
        duration_minutes: 30,
        cost: 75.00,
        payment_status: 'pending',
        is_telemedicine: false,
        is_active: true,
        created_at: '2024-01-15T10:30:00.000Z'
      },
      {
        id: '456e7890-e89b-12d3-a456-426614174001',
        appointment_type: 'vaccination',
        status: 'pending',
        priority: 'normal',
        scheduled_date: '2024-01-22T10:00:00.000Z',
        duration_minutes: 15,
        cost: 45.00,
        payment_status: 'pending',
        is_telemedicine: false,
        is_active: true,
        created_at: '2024-01-15T11:00:00.000Z'
      }
    ]
  })
  data!: Appointment[];

  @ApiProperty({
    description: 'Total number of appointments',
    example: 150
  })
  total!: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1
  })
  page!: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 15
  })
  totalPages!: number;

  @ApiProperty({
    description: 'Success message',
    example: 'Appointments retrieved successfully'
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp!: string;
}

export class AppointmentCreatedResponseDto {
  @ApiProperty({
    description: 'Created appointment data',
    type: Appointment
  })
  data!: Appointment;

  @ApiProperty({
    description: 'Success message',
    example: 'Appointment created successfully'
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp!: string;

  @ApiProperty({
    description: 'Created appointment ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id!: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  createdAt!: string;
}

export class AppointmentUpdatedResponseDto {
  @ApiProperty({
    description: 'Updated appointment data',
    type: Appointment
  })
  data!: Appointment;

  @ApiProperty({
    description: 'Success message',
    example: 'Appointment updated successfully'
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp!: string;

  @ApiProperty({
    description: 'Updated appointment ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id!: string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  updatedAt!: string;

  @ApiProperty({
    description: 'Number of affected rows',
    example: 1
  })
  affectedRows!: number;
}

export class AppointmentCancelledResponseDto {
  @ApiProperty({
    description: 'Cancelled appointment data',
    type: Appointment
  })
  data!: Appointment;

  @ApiProperty({
    description: 'Success message',
    example: 'Appointment cancelled successfully'
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp!: string;

  @ApiProperty({
    description: 'Cancelled appointment ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id!: string;

  @ApiProperty({
    description: 'Cancellation timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  cancelledAt!: string;
}

export class AppointmentRescheduledResponseDto {
  @ApiProperty({
    description: 'Rescheduled appointment data',
    type: Appointment
  })
  data!: Appointment;

  @ApiProperty({
    description: 'Success message',
    example: 'Appointment rescheduled successfully'
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp!: string;

  @ApiProperty({
    description: 'Rescheduled appointment ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id!: string;

  @ApiProperty({
    description: 'Previous scheduled date',
    example: '2024-01-20T14:00:00.000Z'
  })
  previousDate!: string;

  @ApiProperty({
    description: 'New scheduled date',
    example: '2024-01-21T15:00:00.000Z'
  })
  newDate!: string;
}

export class AppointmentStatisticsResponseDto {
  @ApiProperty({
    description: 'Appointment statistics data',
    example: {
      total: 150,
      confirmed: 45,
      pending: 30,
      completed: 60,
      cancelled: 10,
      noShow: 5,
      byType: {
        consultation: 50,
        vaccination: 30,
        surgery: 10,
        follow_up: 20,
        emergency: 5,
        wellness_exam: 35
      },
      byPriority: {
        low: 20,
        normal: 80,
        high: 30,
        urgent: 15,
        emergency: 5
      },
      averageDuration: 35,
      totalRevenue: 11250.00
    }
  })
  data!: {
    total: number;
    confirmed: number;
    pending: number;
    completed: number;
    cancelled: number;
    noShow: number;
    byType: Record<AppointmentType, number>;
    byPriority: Record<AppointmentPriority, number>;
    averageDuration: number;
    totalRevenue: number;
  };

  @ApiProperty({
    description: 'Success message',
    example: 'Appointment statistics retrieved successfully'
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp!: string;
}

export class AppointmentAvailabilityResponseDto {
  @ApiProperty({
    description: 'Available appointment slots',
    example: [
      {
        date: '2024-01-20',
        slots: [
          { time: '09:00', available: true, duration: 30 },
          { time: '09:30', available: true, duration: 30 },
          { time: '10:00', available: false, duration: 30 },
          { time: '10:30', available: true, duration: 30 },
          { time: '14:00', available: true, duration: 30 },
          { time: '14:30', available: true, duration: 30 }
        ]
      },
      {
        date: '2024-01-21',
        slots: [
          { time: '09:00', available: true, duration: 30 },
          { time: '09:30', available: true, duration: 30 },
          { time: '10:00', available: true, duration: 30 },
          { time: '10:30', available: true, duration: 30 }
        ]
      }
    ]
  })
  data!: Array<{
    date: string;
    slots: Array<{
      time: string;
      available: boolean;
      duration: number;
    }>;
  }>;

  @ApiProperty({
    description: 'Success message',
    example: 'Available appointment slots retrieved successfully'
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp!: string;
}

export class AppointmentReminderResponseDto {
  @ApiProperty({
    description: 'Appointment reminder data',
    example: {
      appointmentId: '123e4567-e89b-12d3-a456-426614174000',
      reminderSent: true,
      reminderType: 'email',
      reminderTime: '2024-01-19T14:00:00.000Z',
      recipientEmail: 'owner@example.com',
      message: 'Reminder: Your pet has an appointment tomorrow at 2:00 PM'
    }
  })
  data!: {
    appointmentId: string;
    reminderSent: boolean;
    reminderType: 'email' | 'sms' | 'push';
    reminderTime: string;
    recipientEmail?: string;
    recipientPhone?: string;
    message: string;
  };

  @ApiProperty({
    description: 'Success message',
    example: 'Appointment reminder sent successfully'
  })
  message!: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp!: string;
}
