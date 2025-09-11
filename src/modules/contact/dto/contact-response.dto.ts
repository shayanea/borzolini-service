export class ContactResponseDto {
  id!: string;
  name!: string;
  email!: string;
  subject!: string;
  message!: string;
  consent!: boolean;
  status!: 'pending' | 'in_progress' | 'resolved' | 'closed';
  adminNotes?: string | undefined;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
  createdAt!: Date;
  updatedAt!: Date;
}
