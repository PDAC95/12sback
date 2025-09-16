import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
    login(loginDto: LoginDto, response: Response): Promise<{
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
        };
        message: string;
    }>;
    logout(response: Response): Promise<{
        success: boolean;
        message: string;
    }>;
    getProfile(req: any): Promise<{
        success: boolean;
        data: {
            user: any;
        };
    }>;
}
