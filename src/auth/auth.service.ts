import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

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

    // 5. Create user (for now, store hashed password temporarily)
    // Note: We'll integrate Auth0 later
    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        birthDate: birth,
        auth0Id: `temp_${Date.now()}`, // Temporary ID until Auth0 integration
        emailVerified: false,
        termsAcceptedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        username: true,
        emailVerified: true,
        createdAt: true
      }
    });

    return {
      message: 'Registration successful',
      user
    };
  }

  async login(loginDto: LoginDto) {
    // TODO: Implement login logic with Auth0
    return { message: 'Login endpoint ready' };
  }
}