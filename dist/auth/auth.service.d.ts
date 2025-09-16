import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(registerDto: RegisterDto): Promise<{
        message: string;
        user: {
            id: string;
            email: string;
            username: string;
            emailVerified: boolean;
            createdAt: Date;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        success: boolean;
        data: {
            user: {
                id: string;
                email: string;
                username: string;
                emailVerified: boolean;
                coins: number;
                reputation: number;
            };
            token: string;
        };
        message: string;
    }>;
    validateUser(userId: string): Promise<{
        wallet: {
            coins: number;
        } | null;
        reputation: {
            reliability: number;
        } | null;
        email: string;
        username: string;
        emailVerified: boolean;
        id: string;
    } | null>;
}
