import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
