# API Integration Guide

How to integrate your frontend (web, mobile, PWA) with the Borzolini API.

**Stack:** NestJS backend with REST endpoints  
**Auth:** JWT tokens with refresh  
**Docs:** Interactive Swagger at /api/docs  
**Updated:** August 2025

## API Basics

### URLs and Config

```
Dev:    http://localhost:3001/api/v1
Prod:   https://api.borzolini.com/api/v1
Docs:   http://localhost:3001/api/docs (Swagger UI)

All requests: Content-Type: application/json
Auth: Authorization: Bearer <jwt-token>
```

### Endpoints Structure

```
/api/v1/
├── auth/           - login, register, refresh tokens
├── users/          - user profiles and preferences
├── clinics/        - clinic info and staff
├── pets/           - pet profiles and health records
├── appointments/   - booking and scheduling
├── ai-health/      - AI health recommendations
├── telemedicine/   - video calls (Daily.co)
├── social-media/   - Instagram integration
├── analytics/      - usage tracking
├── payments/       - (coming soon)
└── health/         - API health check
```

## Authentication

### How Login Works

```typescript
// 1. Send credentials
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

// 2. Get tokens back
{
  "user": { id, email, role, etc },
  "accessToken": "eyJ...",  // expires in 15min
  "refreshToken": "eyJ..."  // expires in 7 days
}

// 3. Use access token for requests
Authorization: Bearer eyJ...
```

**Important:** Store the access token in memory/state and refresh token in httpOnly cookie or secure storage. Don't put the refresh token in localStorage (XSS risk).

### Roles and Permissions

```typescript
// We have 4 user roles
enum UserRole {
  PATIENT = 'patient', // pet owners
  STAFF = 'staff', // front desk
  VETERINARIAN = 'veterinarian', // vets
  ADMIN = 'admin', // clinic owner
}

// What each role can do:
// Patient: manage own pets, book appointments, view own data
// Staff: view all appointments, manage bookings, basic clinic info
// Vet: all of staff + medical records, consultations, prescriptions
// Admin: everything + user management, clinic settings, analytics
```

The backend enforces these automatically. Your frontend just needs to show/hide UI based on the user's role.

---

## Frontend Platform Integration

### 1. Web Platform (Next.js 14)

#### API Service Configuration

```typescript
// services/api.ts
class ApiService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  // User Management
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getProfile(): Promise<UserProfile> {
    return this.request<UserProfile>('/users/profile');
  }

  // Clinic Management
  async searchClinics(params: ClinicSearchParams): Promise<Clinic[]> {
    const queryString = new URLSearchParams(params).toString();
    return this.request<Clinic[]>(`/clinics/search?${queryString}`);
  }

  // Appointment Management
  async createAppointment(data: CreateAppointmentData): Promise<Appointment> {
    return this.request<Appointment>('/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiService = new ApiService();
```

#### React Hooks for API Integration

```typescript
// hooks/useApi.ts
import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

export function useApi<T>(endpoint: string, options: { method?: string; body?: any; dependencies?: any[] } = {}) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { method = 'GET', body, dependencies = [] } = options;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        let result: T;
        if (method === 'GET') {
          result = await apiService.request<T>(endpoint);
        } else {
          result = await apiService.request<T>(endpoint, { method, body });
        }

        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint, method, body, ...dependencies]);

  return { data, loading, error };
}

// Usage Example
export function useClinics(searchParams: ClinicSearchParams) {
  return useApi<Clinic[]>('/clinics/search', {
    method: 'GET',
    dependencies: [searchParams],
  });
}
```

---

### 2. Mobile App (React Native)

#### API Service for Mobile

```typescript
// services/api.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

class MobileApiService {
  private baseURL = __DEV__
    ? 'http://10.0.2.2:3001/api/v1' // Android emulator
    : 'https://api.borzolini.com/api/v1';

  private token: string | null = null;
  private isOnline: boolean = true;

  constructor() {
    this.initializeNetworkListener();
    this.loadStoredToken();
  }

  private async initializeNetworkListener() {
    NetInfo.addEventListener((state) => {
      this.isOnline = state.isConnected ?? false;
    });
  }

  private async loadStoredToken() {
    try {
      this.token = await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Failed to load stored token:', error);
    }
  }

  async setToken(token: string) {
    this.token = token;
    try {
      await AsyncStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Failed to store token:', error);
    }
  }

  async logout() {
    this.token = null;
    try {
      await AsyncStorage.removeItem('auth_token');
    } catch (error) {
      console.error('Failed to remove token:', error);
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!this.isOnline) {
      throw new Error('No internet connection');
    }

    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      await this.logout();
      throw new Error('Authentication expired');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    return response.json();
  }

  // Mobile-specific endpoints
  async getOfflineData(): Promise<OfflineData> {
    return this.request<OfflineData>('/users/offline-data');
  }

  async syncOfflineChanges(changes: OfflineChange[]): Promise<void> {
    return this.request<void>('/users/sync-offline', {
      method: 'POST',
      body: JSON.stringify(changes),
    });
  }
}

export const mobileApiService = new MobileApiService();
```

---

### 3. Admin Dashboard (Vite + React)

#### Admin API Service

```typescript
// services/adminApi.ts
class AdminApiService {
  private baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (response.status === 403) {
      throw new Error('Insufficient permissions');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    return response.json();
  }

  // Admin-specific endpoints
  async getClinicStats(clinicId: string): Promise<ClinicStats> {
    return this.request<ClinicStats>(`/analytics/clinic/${clinicId}/stats`);
  }

  async getSystemAnalytics(): Promise<SystemAnalytics> {
    return this.request<SystemAnalytics>('/analytics/system');
  }

  async manageUser(userId: string, action: 'activate' | 'deactivate'): Promise<void> {
    return this.request<void>(`/users/${userId}/${action}`, {
      method: 'PUT',
    });
  }
}

export const adminApiService = new AdminApiService();
```

---

### 4. PWA (Progressive Web App)

#### PWA API Service with Offline Support

```typescript
// services/pwaApi.ts
class PwaApiService {
  private baseURL = 'http://localhost:3001/api/v1';
  private token: string | null = null;
  private offlineQueue: OfflineRequest[] = [];

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!navigator.onLine) {
      return this.handleOfflineRequest<T>(endpoint, options);
    }

    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      if (!navigator.onLine) {
        return this.handleOfflineRequest<T>(endpoint, options);
      }
      throw error;
    }
  }

  private async handleOfflineRequest<T>(endpoint: string, options: RequestInit): Promise<T> {
    const offlineRequest: OfflineRequest = {
      id: Date.now().toString(),
      endpoint,
      options,
      timestamp: new Date(),
    };

    this.offlineQueue.push(offlineRequest);
    this.storeOfflineQueue();

    // Return cached data if available
    const cachedData = await this.getCachedData<T>(endpoint);
    if (cachedData) {
      return cachedData;
    }

    throw new Error('Offline mode: No cached data available');
  }

  private async storeOfflineQueue() {
    try {
      localStorage.setItem('offline_queue', JSON.stringify(this.offlineQueue));
    } catch (error) {
      console.error('Failed to store offline queue:', error);
    }
  }

  private async getCachedData<T>(endpoint: string): Promise<T | null> {
    try {
      const cached = localStorage.getItem(`cache_${endpoint}`);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        // Check if cache is still valid (24 hours)
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          return data;
        }
      }
    } catch (error) {
      console.error('Failed to get cached data:', error);
    }
    return null;
  }

  async syncOfflineQueue(): Promise<void> {
    if (!navigator.onLine || this.offlineQueue.length === 0) {
      return;
    }

    const queue = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const request of queue) {
      try {
        await this.request(request.endpoint, request.options);
      } catch (error) {
        console.error('Failed to sync offline request:', error);
        this.offlineQueue.push(request);
      }
    }

    this.storeOfflineQueue();
  }
}

export const pwaApiService = new PwaApiService();
```

---

## Real-Time Features Integration

### WebSocket Integration for Real-Time Updates

```typescript
// services/websocket.ts
class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(token: string) {
    const wsUrl = `ws://localhost:3001/ws?token=${token}`;

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.attemptReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private handleMessage(data: WebSocketMessage) {
    switch (data.type) {
      case 'appointment_update':
        this.handleAppointmentUpdate(data.payload);
        break;
      case 'health_alert':
        this.handleHealthAlert(data.payload);
        break;
      case 'notification':
        this.handleNotification(data.payload);
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  private handleAppointmentUpdate(payload: AppointmentUpdate) {
    // Emit event for components to listen to
    window.dispatchEvent(
      new CustomEvent('appointment_update', {
        detail: payload,
      })
    );
  }

  private handleHealthAlert(payload: HealthAlert) {
    window.dispatchEvent(
      new CustomEvent('health_alert', {
        detail: payload,
      })
    );
  }

  private handleNotification(payload: Notification) {
    window.dispatchEvent(
      new CustomEvent('notification', {
        detail: payload,
      })
    );
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect(localStorage.getItem('auth_token') || '');
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }
}

export const websocketService = new WebSocketService();
```

---

## Error Handling & Retry Logic

### Global Error Handler

```typescript
// utils/errorHandler.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: any): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return new ApiError('Network error. Please check your connection.', 0, 'NETWORK_ERROR');
  }

  if (error.status === 401) {
    return new ApiError('Authentication expired. Please login again.', 401, 'AUTH_EXPIRED');
  }

  if (error.status === 403) {
    return new ApiError('Insufficient permissions for this action.', 403, 'INSUFFICIENT_PERMISSIONS');
  }

  if (error.status === 429) {
    return new ApiError('Too many requests. Please try again later.', 429, 'RATE_LIMITED');
  }

  return new ApiError(error.message || 'An unexpected error occurred.', error.status || 500, 'UNKNOWN_ERROR');
}
```

### Retry Logic with Exponential Backoff

```typescript
// utils/retry.ts
export async function withRetry<T>(fn: () => Promise<T>, maxRetries: number = 3, baseDelay: number = 1000): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        throw lastError;
      }

      // Don't retry on client errors (4xx)
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

// Usage
const result = await withRetry(() => apiService.createAppointment(appointmentData), 3, 1000);
```

---

## Testing & Mocking

### API Mocking for Development

```typescript
// mocks/apiMocks.ts
export const mockApiResponses = {
 '/auth/login': {
 user: {
 id: 'user-123',
 email: 'test@example.com',
 role: 'pet_owner',
 firstName: 'John',
 lastName: 'Doe',
 },
 accessToken: 'mock-jwt-token',
 refreshToken: 'mock-refresh-token',
 },

```
