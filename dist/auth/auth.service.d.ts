import { PrismaService } from '../database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private prisma;
    constructor(prisma: PrismaService);
    register(registerDto: RegisterDto): Promise<{
        message: string;
        user: {
            email: string;
            username: string;
            emailVerified: boolean;
            id: string;
            createdAt: Date;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        message: string;
    }>;
}
