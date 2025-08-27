#!/usr/bin/env ts-node

import * as bcrypt from 'bcryptjs';

import { AppModule } from '../src/app.module';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { NestFactory } from '@nestjs/core';
import { UsersService } from '../src/modules/users/users.service';

interface TokenPayload {
  email: string;
  sub: string;
  role: string;
}

interface GeneratedTokens {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
  };
}

class TokenGenerator {
  private jwtService!: JwtService;
  private configService!: ConfigService;
  private usersService!: UsersService;

  constructor() {}

  async initialize() {
    console.log('🚀 Initializing Token Generator...');

    const app = await NestFactory.createApplicationContext(AppModule);

    this.jwtService = app.get(JwtService);
    this.configService = app.get(ConfigService);
    this.usersService = app.get(UsersService);

    console.log('✅ Token Generator initialized successfully');
  }

  private async generateTokens(user: any): Promise<GeneratedTokens> {
    const payload: TokenPayload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    const jwtRefreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    const jwtExpiresIn = this.configService.get<string>('JWT_EXPIRES_IN') || '15m';
    const jwtRefreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';

    if (!jwtSecret || !jwtRefreshSecret) {
      throw new Error('JWT secrets not configured');
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: jwtSecret,
        expiresIn: jwtExpiresIn,
      }),
      this.jwtService.signAsync(payload, {
        secret: jwtRefreshSecret,
        expiresIn: jwtRefreshExpiresIn,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async generateTokensForUser(email: string, password: string): Promise<GeneratedTokens> {
    console.log(`🔐 Generating tokens for user: ${email}`);

    // Validate user credentials
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new Error(`User with email ${email} not found`);
    }

    if (!user.canLogin()) {
      throw new Error('User account is not active or email not verified');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    console.log(`✅ Tokens generated successfully for ${user.firstName} ${user.lastName}`);
    return tokens;
  }

  async generateTokensForNewUser(userData: { email: string; password: string; firstName: string; lastName: string; role?: string }): Promise<GeneratedTokens> {
    console.log(`👤 Creating new user and generating tokens: ${userData.email}`);

    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(userData.email);
    if (existingUser) {
      throw new Error(`User with email ${userData.email} already exists`);
    }

    // Create user
    const createUserDto = {
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: (userData.role || 'patient') as 'patient' | 'veterinarian' | 'staff' | 'admin',
    };

    const newUser = await this.usersService.create(createUserDto);

    // Generate tokens
    const tokens = await this.generateTokens(newUser);

    console.log(`✅ New user created and tokens generated successfully`);
    return tokens;
  }

  async listExistingUsers(): Promise<void> {
    console.log('📋 Listing existing users...');

    try {
      const usersResult = await this.usersService.findAll();
      const users = usersResult.users;

      if (users.length === 0) {
        console.log('No users found in the database');
        return;
      }

      console.log('\nExisting users:');
      console.log('─'.repeat(80));
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Status: ${user.isActive ? 'Active' : 'Inactive'}`);
        console.log(`   Email Verified: ${user.isEmailVerified ? 'Yes' : 'No'}`);
        console.log(`   Phone Verified: ${user.isPhoneVerified ? 'Yes' : 'No'}`);
        console.log('─'.repeat(80));
      });
    } catch (error) {
      console.error('❌ Error listing users:', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  displayTokens(tokens: GeneratedTokens): void {
    console.log('\n🎯 Generated Tokens:');
    console.log('='.repeat(80));

    console.log(`👤 User: ${tokens.user.firstName} ${tokens.user.lastName}`);
    console.log(`📧 Email: ${tokens.user.email}`);
    console.log(`🔑 Role: ${tokens.user.role}`);
    console.log(`🆔 User ID: ${tokens.user.id}`);

    console.log('\n🔐 Access Token:');
    console.log(tokens.accessToken);

    console.log('\n🔄 Refresh Token:');
    console.log(tokens.refreshToken);

    console.log('\n📝 Usage Examples:');
    console.log('─'.repeat(80));

    // cURL examples
    console.log('cURL with Bearer Token:');
    console.log(`curl -H "Authorization: Bearer ${tokens.accessToken}" http://localhost:3001/api/users/profile`);

    console.log('\ncURL with Cookie:');
    console.log(`curl -H "Cookie: accessToken=${tokens.accessToken}" http://localhost:3001/api/users/profile`);

    // JavaScript/TypeScript examples
    console.log('\nJavaScript/TypeScript:');
    console.log(`const headers = {`);
    console.log(`  'Authorization': 'Bearer ${tokens.accessToken}'`);
    console.log(`};`);

    console.log('\n// Or with cookies');
    console.log(`const cookies = {`);
    console.log(`  accessToken: '${tokens.accessToken}',`);
    console.log(`  refreshToken: '${tokens.refreshToken}'`);
    console.log(`};`);

    console.log('\n📋 Environment Variables:');
    console.log('─'.repeat(80));
    console.log(`export ACCESS_TOKEN="${tokens.accessToken}"`);
    console.log(`export REFRESH_TOKEN="${tokens.refreshToken}"`);
    console.log(`export USER_ID="${tokens.user.id}"`);

    console.log('\n🔒 Token Expiry:');
    console.log('─'.repeat(80));
    console.log('Access Token: 15 minutes (configurable via JWT_EXPIRES_IN)');
    console.log('Refresh Token: 7 days (configurable via JWT_REFRESH_EXPIRES_IN)');

    console.log('='.repeat(80));
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const tokenGenerator = new TokenGenerator();

  try {
    await tokenGenerator.initialize();

    switch (command) {
      case 'list':
        await tokenGenerator.listExistingUsers();
        break;

      case 'generate':
        if (args.length < 3) {
          console.log('Usage: npm run generate-tokens generate <email> <password>');
          console.log('Example: npm run generate-tokens generate admin@borzolini.com Password123!');
          process.exit(1);
        }

        const email = args[1]!;
        const password = args[2]!;

        const tokens = await tokenGenerator.generateTokensForUser(email, password);
        tokenGenerator.displayTokens(tokens);
        break;

      case 'create':
        if (args.length < 5) {
          console.log('Usage: npm run generate-tokens create <email> <password> <firstName> <lastName> [role]');
          console.log('Example: npm run generate-tokens create test@example.com Password123! John Doe user');
          process.exit(1);
        }

        const userData = {
          email: args[1]!,
          password: args[2]!,
          firstName: args[3]!,
          lastName: args[4]!,
          role: args[5] || 'patient',
        };

        const newUserTokens = await tokenGenerator.generateTokensForNewUser(userData);
        tokenGenerator.displayTokens(newUserTokens);
        break;

      case 'help':
      default:
        console.log('🔐 Token Generator - Generate JWT tokens for testing');
        console.log('='.repeat(60));
        console.log('');
        console.log('Available commands:');
        console.log('');
        console.log('  list                                    - List all existing users');
        console.log('  generate <email> <password>             - Generate tokens for existing user');
        console.log('  create <email> <password> <firstName> <lastName> [role] - Create new user and generate tokens');
        console.log('  help                                    - Show this help message');
        console.log('');
        console.log('Examples:');
        console.log('');
        console.log('  # List existing users');
        console.log('  npm run generate-tokens list');
        console.log('');
        console.log('  # Generate tokens for existing user');
        console.log('  npm run generate-tokens generate admin@borzolini.com Password123!');
        console.log('');
        console.log('  # Create new user and generate tokens');
        console.log('  npm run generate-tokens create test@example.com Password123! John Doe user');
        console.log('');
        console.log('Note: Default password for seeded users is "Password123!"');
        console.log('');
        break;
    }
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}
