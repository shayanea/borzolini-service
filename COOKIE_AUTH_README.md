# Cookie-Based Authentication Guide

## Overview

This API now supports cookie-based authentication as a more secure alternative to sending JWT tokens via headers. The system automatically sets `httpOnly` cookies for access and refresh tokens, providing better security against XSS attacks.

## How It Works

### 1. Authentication Flow

1. **Login/Register**: When a user logs in or registers, the API sets two cookies:
   - `accessToken`: Short-lived (15 minutes) for API requests
   - `refreshToken`: Long-lived (10 days) for token refresh

2. **API Requests**: The access token is automatically sent with each request via cookies
3. **Token Refresh**: When the access token expires, the refresh token is used to get a new pair
4. **Logout**: Both cookies are cleared when the user logs out

### 2. Cookie Security Features

- **httpOnly**: Prevents JavaScript access to tokens (XSS protection)
- **Secure**: Only sent over HTTPS in production
- **SameSite**: Prevents CSRF attacks
- **Domain**: Configurable for subdomain support

## Frontend Implementation

### React/React Native Example

```typescript
// API client configuration
const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api/v1',
  withCredentials: true, // This is crucial for cookies!
});

// Login function
const login = async (email: string, password: string) => {
  try {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });

    // Cookies are automatically set by the browser
    // No need to manually store tokens!

    return response.data.user;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

// Making authenticated requests
const getProfile = async () => {
  try {
    // Cookies are automatically sent with the request
    const response = await apiClient.get('/auth/profile');
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      // Token expired, try to refresh
      await refreshToken();
      // Retry the request
      return await apiClient.get('/auth/profile');
    }
    throw error;
  }
};

// Refresh token function
const refreshToken = async () => {
  try {
    // The refresh token cookie is automatically sent
    await apiClient.post('/auth/refresh');
    // New cookies are automatically set
  } catch (error) {
    // Refresh failed, redirect to login
    window.location.href = '/login';
  }
};

// Logout function
const logout = async () => {
  try {
    await apiClient.post('/auth/logout');
    // Cookies are automatically cleared
    // Redirect to login page
    window.location.href = '/login';
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
```

### React Native with Expo

```typescript
import * as SecureStore from 'expo-secure-store';

// For React Native, you might need to handle cookies manually
// since the browser cookie system isn't available

const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api/v1',
});

// Interceptor to add tokens to headers for React Native
apiClient.interceptors.request.use(async (config) => {
  const accessToken = await SecureStore.getItemAsync('accessToken');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      if (refreshToken) {
        try {
          const refreshResponse = await apiClient.post('/auth/refresh', {
            refreshToken,
          });

          // Store new tokens
          await SecureStore.setItemAsync('accessToken', refreshResponse.data.accessToken);
          await SecureStore.setItemAsync('refreshToken', refreshResponse.data.refreshToken);

          // Retry original request
          error.config.headers.Authorization = `Bearer ${refreshResponse.data.accessToken}`;
          return apiClient.request(error.config);
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          await SecureStore.deleteItemAsync('accessToken');
          await SecureStore.deleteItemAsync('refreshToken');
          // Navigate to login
        }
      }
    }
    return Promise.reject(error);
  }
);
```

## Environment Configuration

Add these variables to your `.env` file:

```bash
# Cookie Configuration
COOKIE_DOMAIN=localhost  # or your domain in production
NODE_ENV=development     # or production
```

## Backward Compatibility

The API maintains backward compatibility with header-based authentication:

- **Cookies**: Primary method (recommended)
- **Authorization Header**: Fallback method for existing clients

## Security Benefits

1. **XSS Protection**: `httpOnly` cookies prevent JavaScript access to tokens
2. **CSRF Protection**: `SameSite` attribute prevents cross-site request forgery
3. **Automatic Token Management**: No need to manually handle token storage/refresh
4. **Secure by Default**: Cookies are automatically secure in production

## Testing

### With Postman

1. Enable "Send cookies" in the request settings
2. Make a login request to get cookies
3. Subsequent requests will automatically include cookies

### With cURL

```bash
# Login and save cookies
curl -c cookies.txt -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Use cookies for authenticated request
curl -b cookies.txt http://localhost:3001/api/v1/auth/profile
```

## Troubleshooting

### Common Issues

1. **Cookies not being sent**: Ensure `withCredentials: true` is set
2. **CORS errors**: Verify CORS is configured with `credentials: true`
3. **Cookie domain issues**: Check `COOKIE_DOMAIN` environment variable
4. **HTTPS required**: In production, cookies require HTTPS

### Debug Mode

Enable cookie debugging by setting:

```bash
NODE_ENV=development
```

This will log cookie operations to the console.

## Migration from Header-Based Auth

If you're migrating from header-based authentication:

1. Update your frontend to use `withCredentials: true`
2. Remove manual token storage/retrieval
3. Update your API client to handle automatic cookie management
4. Test the new flow thoroughly

The API will continue to work with both methods during the transition period.
