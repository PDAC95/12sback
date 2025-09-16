import { Controller, Post, Body, Res, UseGuards, Get, Request } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
    try {
      const result = await this.authService.login(loginDto);

      // Set httpOnly cookie with JWT token
      response.cookie('token', result.data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Return success without exposing token
      return {
        success: true,
        data: {
          user: result.data.user,
        },
        message: result.message,
      };
    } catch (error) {
      throw error;
    }
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    // Clear the token cookie
    response.clearCookie('token');

    return {
      success: true,
      message: 'Logout successful',
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    // req.user is populated by JwtStrategy.validate()
    return {
      success: true,
      data: {
        user: req.user,
      },
    };
  }
}