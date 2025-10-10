# Scripts Directory

This directory contains utility scripts for development, testing, and maintenance tasks.

## Token Generator Script

The `generate-tokens.ts` script allows you to generate JWT access and refresh tokens for testing purposes.

### Prerequisites

1. Make sure your environment variables are properly configured (see `config.env.example`)
2. Ensure your database is running and migrations have been applied
3. The script requires the following environment variables:
 - `JWT_SECRET`
 - `JWT_REFRESH_SECRET`
 - `JWT_EXPIRES_IN` (optional, defaults to 30m)
 - `JWT_REFRESH_EXPIRES_IN` (optional, defaults to 7d)

### Usage

#### List Existing Users
```bash
npm run generate-tokens list
```
This will show all users in the database with their details.

#### Generate Tokens for Existing User
```bash
npm run generate-tokens generate <email> <password>
```

**Example:**
```bash
npm run generate-tokens generate admin@borzolini.com Password123!
```

**Note:** The default password for seeded users is `Password123!`

#### Create New User and Generate Tokens
```bash
npm run generate-tokens create <email> <password> <firstName> <lastName> [role]
```

**Example:**
```bash
npm run generate-tokens create test@example.com Password123! John Doe user
```

**Available roles:** `admin`, `veterinarian`, `user`, `clinic_staff`

#### Show Help
```bash
npm run generate-tokens help
```

### Output

The script will generate:
- **Access Token**: Short-lived token (15 minutes by default) for API requests
- **Refresh Token**: Long-lived token (7 days by default) for token renewal

### Token Usage Examples

#### cURL with Bearer Token
```bash
curl -H "Authorization: Bearer <ACCESS_TOKEN>" http://localhost:3001/api/users/profile
```

#### cURL with Cookie
```bash
curl -H "Cookie: accessToken=<ACCESS_TOKEN>" http://localhost:3001/api/users/profile
```

#### JavaScript/TypeScript
```typescript
const headers = {
 'Authorization': 'Bearer <ACCESS_TOKEN>'
};

// Or with cookies
const cookies = {
 accessToken: '<ACCESS_TOKEN>',
 refreshToken: '<REFRESH_TOKEN>'
};
```

#### Environment Variables
```bash
export ACCESS_TOKEN="<ACCESS_TOKEN>"
export REFRESH_TOKEN="<REFRESH_TOKEN>"
export USER_ID="<USER_ID>"
```

### Seeded Users

The system comes with pre-seeded users for testing:

1. **Admin User**
 - Email: `admin@borzolini.com`
 - Password: `Password123!`
 - Role: `admin`

2. **Veterinarian Users**
 - Email: `dr.smith@borzolini.com`
 - Email: `dr.johnson@borzolini.com`
 - Password: `Password123!`
 - Role: `veterinarian`

### Security Notes

- **Never commit tokens to version control**
- **Access tokens expire after 15 minutes** (configurable)
- **Refresh tokens expire after 7 days** (configurable)
- **Use environment variables** for storing tokens in development
- **Rotate refresh tokens** regularly in production

### Troubleshooting

#### Common Issues

1. **"JWT secrets not configured"**
 - Check your environment variables
 - Ensure `JWT_SECRET` and `JWT_REFRESH_SECRET` are set

2. **"User not found"**
 - Verify the email address
 - Check if the user exists in the database
 - Run `npm run generate-tokens list` to see available users

3. **"Invalid password"**
 - Use the correct password for seeded users: `Password123!`
 - Check if the user account is active and verified

4. **"Database connection error"**
 - Ensure your database is running
 - Check database configuration in environment variables
 - Run migrations if needed: `npm run migrate`

### Other Scripts

- **`run-migrations.ts`**: Run database migrations
- **`generate-swagger.ts`**: Generate Swagger API documentation
- **`test-swagger.ts`**: Test Swagger documentation generation
