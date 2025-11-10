import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { OAuth2Client } = require('google-auth-library');

@Injectable()
export class GoogleAuthService {
  private readonly logger = new Logger(GoogleAuthService.name);
  private client: any;

  constructor(private configService: ConfigService) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    if (!clientId) {
      throw new Error('GOOGLE_CLIENT_ID is not configured');
    }
    this.client = new OAuth2Client(clientId);
  }

  async verifyToken(token: string): Promise<{
    googleId: string;
    email: string;
    firstName: string;
    lastName: string;
    picture?: string;
  }> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: token,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Invalid token payload');
      }

      if (!payload.email) {
        throw new UnauthorizedException('Email not found in token');
      }

      return {
        googleId: payload.sub,
        email: payload.email,
        firstName: payload.given_name || '',
        lastName: payload.family_name || '',
        picture: payload.picture,
      };
    } catch (error) {
      this.logger.error('Google token verification failed:', error);
      throw new UnauthorizedException('Invalid Google token');
    }
  }
}

