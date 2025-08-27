/**
 * DTO Examples for Swagger Documentation
 * This file contains all the examples used in DTOs to keep them clean and centralized
 */

// Pet DTO Examples
export const PET_DTO_EXAMPLES = {
  NAME: 'Buddy',
  SPECIES: 'dog',
  BREED: 'Golden Retriever',
  GENDER: 'male',
  DATE_OF_BIRTH: '2020-03-15',
  WEIGHT: 45.5,
  SIZE: 'medium',
  COLOR: 'Golden',
  MICROCHIP_NUMBER: '123456789012345',
  MEDICAL_HISTORY: 'No known health issues',
  BEHAVIORAL_NOTES: 'Friendly with other dogs',
  DIETARY_REQUIREMENTS: 'Grain-free diet',
  ALLERGIES: ['Peanuts', 'Dairy'],
  MEDICATIONS: ['Heartgard', 'Flea treatment'],
  EMERGENCY_CONTACT: 'John Doe',
  EMERGENCY_PHONE: '+1234567890',
  PHOTO_URL: 'https://example.com/pet-photo.jpg',
};

// User DTO Examples
export const USER_DTO_EXAMPLES = {
  EMAIL: 'john.doe@example.com',
  PASSWORD: 'securePassword123',
  FIRST_NAME: 'John',
  LAST_NAME: 'Doe',
  PHONE: '+1234567890',
  ROLE: 'patient',
  ADDRESS: '123 Main St',
  CITY: 'New York',
  COUNTRY: 'USA',
  POSTAL_CODE: '10001',
  DATE_OF_BIRTH: '1990-01-01',
  GENDER: 'male',
  EMERGENCY_CONTACT_NAME: 'Jane Doe',
  EMERGENCY_CONTACT_PHONE: '+1234567891',
  EMERGENCY_CONTACT_RELATIONSHIP: 'spouse',
  MEDICAL_HISTORY: 'No significant medical history',
  ALLERGIES: 'None known',
  MEDICATIONS: 'None',
};

// Clinic DTO Examples
export const CLINIC_DTO_EXAMPLES = {
  NAME: 'Borzolini Pet Clinic',
  DESCRIPTION: 'Leading veterinary clinic providing comprehensive pet care',
  ADDRESS: '123 Pet Care Avenue',
  CITY: 'New York',
  STATE: 'NY',
  POSTAL_CODE: '10001',
  COUNTRY: 'USA',
  PHONE: '+1-555-0123',
  EMAIL: 'info@borzolini.com',
  WEBSITE: 'https://borzolini.com',
  LOGO_URL: 'https://example.com/logo.png',
  BANNER_URL: 'https://example.com/banner.jpg',
  OPENING_TIME: '09:00',
  CLOSING_TIME: '17:00',
  IS_24_HOURS: false,
};

// Clinic Service DTO Examples
export const CLINIC_SERVICE_DTO_EXAMPLES = {
  NAME: 'Wellness Exam',
  DESCRIPTION: 'Comprehensive health checkup including physical examination and vaccinations',
  CATEGORY: 'preventive',
  DURATION_MINUTES: 45,
  PRICE: 75,
  CURRENCY: 'USD',
};

// Appointment DTO Examples
export const APPOINTMENT_DTO_EXAMPLES = {
  PET_ID: 'uuid-string',
  CLINIC_ID: 'uuid-string',
  APPOINTMENT_DATE: '2024-02-15',
  APPOINTMENT_TIME: '14:30',
  REASON: 'Annual wellness checkup',
  NOTES: 'Pet has been showing signs of lethargy',
};

// Common Examples
export const COMMON_DTO_EXAMPLES = {
  UUID: '123e4567-e89b-12d3-a456-426614174000',
  TIMESTAMP: '2024-01-15T10:30:00.000Z',
  BOOLEAN: true,
  NUMBER: 42,
  STRING: 'example string',
};

// Response Examples
export const RESPONSE_DTO_EXAMPLES = {
  SUCCESS_MESSAGE: 'Operation completed successfully',
  ERROR_MESSAGE: 'Bad Request',
  REQUEST_ID: 'req_123e4567-e89b-12d3-a456-426614174000',
};
