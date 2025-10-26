# Token Column Length Fix

## Issue

When attempting to login, the application was throwing the following error:

```
QueryFailedError: value too long for type character varying(255)
```

This occurred because JWT tokens can be longer than 255 characters, but the database column for `refresh_token` was defined as `VARCHAR(255)`.

## Solution

1. Created a database migration (`026-fix-refresh-token-column-length.sql`) to convert token columns from `VARCHAR(255)` to `TEXT`:
   - `refresh_token`
   - `email_verification_token`
   - `password_reset_token`

2. Updated the User entity (`src/modules/users/entities/user.entity.ts`) to explicitly specify `type: 'text'` for these columns to match the database schema.

## Testing

- Login functionality now works correctly with credentials: `shayan.araghi@borzolini.com` / `Password123!`
- No more database errors when storing JWT tokens
- Access and refresh tokens are properly stored in the database

## Files Changed

- `src/database/migrations/026-fix-refresh-token-column-length.sql` - Database migration
- `src/modules/users/entities/user.entity.ts` - Entity definition update

## Date

2024
