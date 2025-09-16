import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Extract from cookies (httpOnly)
        (request) => {
          return request?.cookies?.token;
        },
        // Fallback to Authorization header
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    // payload contains the decoded JWT data
    const { sub: userId, email, username } = payload;

    // Optionally verify user still exists in database
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        emailVerified: true,
        wallet: {
          select: {
            coins: true,
          },
        },
        reputation: {
          select: {
            reliability: true,
          },
        },
      },
    });

    if (!user) {
      return null; // User not found, will trigger 401
    }

    // This will be attached to request.user
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      emailVerified: user.emailVerified,
      coins: user.wallet?.coins || 0,
      reputation: user.reputation?.reliability || 100,
    };
  }
}