import { PrismaService } from '../database/prisma.service';
declare const JwtStrategy_base: new (...args: any) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private prisma;
    constructor(prisma: PrismaService);
    validate(payload: any): Promise<{
        id: string;
        email: string;
        username: string;
        emailVerified: boolean;
        coins: number;
        reputation: number;
    } | null>;
}
export {};
