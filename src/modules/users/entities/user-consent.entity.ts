export interface UserConsent {
  id: string;
  userId: string;
  consentType: string;
  version: string;
  acceptedAt: Date;
  withdrawnAt?: Date;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}
