import { ApiProperty } from '@nestjs/swagger';
import { PetHostingBooking } from '../entities/pet-hosting-booking.entity';

export class BookingResponseDto {
  @ApiProperty({ description: 'Booking data' })
  booking!: PetHostingBooking;

  @ApiProperty({ description: 'Duration in days' })
  duration_days!: number;

  @ApiProperty({ description: 'Whether booking can be reviewed' })
  can_be_reviewed!: boolean;
}

