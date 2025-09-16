import { Injectable, BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, username, password, birthDate } = registerDto;

    // 1. Validate age (18+)
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    if (age < 18) {
      throw new BadRequestException('You must be 18 or older to register');
    }

    // 2. Check if username exists
    const existingUsername = await this.prisma.user.findUnique({
      where: { username }
    });

    if (existingUsername) {
      throw new ConflictException('Username already taken');
    }

    // 3. Check if email exists
    const existingEmail = await this.prisma.user.findUnique({
      where: { email }
    });

    if (existingEmail) {
      throw new ConflictException('Email already registered');
    }

    // 4. Hash password (temporary storage until Auth0 integration)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Create user transaction (user + password + wallet + reputation)
    const result = await this.prisma.$transaction(async (prisma) => {
      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          username,
          birthDate: birth,
          auth0Id: `temp_${Date.now()}`, // Temporary ID until Auth0 integration
          emailVerified: false,
          termsAcceptedAt: new Date(),
        },
      });

      // Store password temporarily
      await prisma.userPassword.create({
        data: {
          userId: user.id,
          passwordHash: hashedPassword,
        },
      });

      // Create wallet with welcome coins (100)
      await prisma.wallet.create({
        data: {
          userId: user.id,
          coins: 100, // Welcome bonus
        },
      });

      // Create reputation record
      await prisma.reputation.create({
        data: {
          userId: user.id,
        },
      });

      return user;
    });

    return {
      message: 'Registration successful',
      user: {
        id: result.id,
        email: result.email,
        username: result.username,
        emailVerified: result.emailVerified,
        createdAt: result.createdAt,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 1. Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        password: true,
        wallet: true,
        reputation: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 2. Check if user has a password record (temporary)
    if (!user.password) {
      throw new UnauthorizedException('Please register first');
    }

    // 3. Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 4. Generate JWT payload
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      emailVerified: user.emailVerified,
    };

    // 5. Generate JWT token
    const token = this.jwtService.sign(payload);

    // 6. Return user data and token
    return {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          emailVerified: user.emailVerified,
          coins: user.wallet?.coins || 0,
          reputation: user.reputation?.reliability || 100,
        },
        token,
      },
      message: 'Login successful',
    };
  }

  // Helper method to validate user exists and is active
  async validateUser(userId: string) {
    return await this.prisma.user.findUnique({
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
  }
}