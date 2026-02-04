import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { SignupDto, LoginDto, GoogleAuthDto } from './dto';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
    );
  }

  async signup(signupDto: SignupDto) {
    const { email, password, name } = signupDto;

    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Get free plan
    const freePlan = await this.prisma.plan.findFirst({
      where: { isFree: true, isActive: true },
    });

    if (!freePlan) {
      throw new BadRequestException('No free plan available');
    }

    // Create user with subscription and credits
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        subscription: {
          create: {
            planId: freePlan.id,
            status: 'TRIAL',
            billingCycle: 'MONTHLY',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
        credits: {
          create: {
            totalCredits: freePlan.creditsPerMonth,
            usedCredits: 0,
            bonusCredits: 0,
            nextResetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
      },
      include: {
        subscription: { include: { plan: true } },
        credits: true,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscription: user.subscription,
        credits: user.credits,
      },
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        subscription: { include: { plan: true } },
        credits: true,
      },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        subscription: user.subscription,
        credits: user.credits,
      },
      ...tokens,
    };
  }

  async googleAuth(googleAuthDto: GoogleAuthDto) {
    const { token } = googleAuthDto;

    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();

      if (!payload || !payload.email) {
        throw new UnauthorizedException('Invalid Google token');
      }

      let user = await this.prisma.user.findUnique({
        where: { email: payload.email },
        include: {
          subscription: { include: { plan: true } },
          credits: true,
        },
      });

      if (!user) {
        // Create new user from Google
        const freePlan = await this.prisma.plan.findFirst({
          where: { isFree: true, isActive: true },
        });

        if (!freePlan) {
          throw new BadRequestException('No free plan available');
        }

        user = await this.prisma.user.create({
          data: {
            email: payload.email,
            name: payload.name,
            googleId: payload.sub,
            avatarUrl: payload.picture,
            emailVerified: payload.email_verified || false,
            subscription: {
              create: {
                planId: freePlan.id,
                status: 'TRIAL',
                billingCycle: 'MONTHLY',
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(
                  Date.now() + 30 * 24 * 60 * 60 * 1000,
                ),
              },
            },
            credits: {
              create: {
                totalCredits: freePlan.creditsPerMonth,
                usedCredits: 0,
                bonusCredits: 0,
                nextResetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              },
            },
          },
          include: {
            subscription: { include: { plan: true } },
            credits: true,
          },
        });
      } else if (!user.googleId) {
        // Link Google account to existing user
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: payload.sub,
            avatarUrl: payload.picture || user.avatarUrl,
            emailVerified: true,
          },
          include: {
            subscription: { include: { plan: true } },
            credits: true,
          },
        });
      }

      const tokens = await this.generateTokens(user.id, user.email);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl,
          subscription: user.subscription,
          credits: user.credits,
        },
        ...tokens,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user.id, user.email);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '15m',
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn:
            this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
