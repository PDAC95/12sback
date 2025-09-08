import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createUserDto: CreateUserDto): Promise<{
        wallet: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            coins: number;
            bonusCoins: number;
            totalWon: number;
            totalLost: number;
            userId: string;
        } | null;
        reputation: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            reliability: number;
            fairPlay: number;
            punctuality: number;
            totalBets: number;
            disputesWon: number;
            disputesLost: number;
            userId: string;
        } | null;
    } & {
        email: string;
        phone: string;
        fullName: string;
        birthDate: Date;
        idPhotoUrl: string | null;
        selfieWithIdUrl: string | null;
        id: string;
        kycStatus: import("generated/prisma").$Enums.KycStatus;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<({
        wallet: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            coins: number;
            bonusCoins: number;
            totalWon: number;
            totalLost: number;
            userId: string;
        } | null;
        reputation: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            reliability: number;
            fairPlay: number;
            punctuality: number;
            totalBets: number;
            disputesWon: number;
            disputesLost: number;
            userId: string;
        } | null;
    } & {
        email: string;
        phone: string;
        fullName: string;
        birthDate: Date;
        idPhotoUrl: string | null;
        selfieWithIdUrl: string | null;
        id: string;
        kycStatus: import("generated/prisma").$Enums.KycStatus;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: string): Promise<{
        wallet: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            coins: number;
            bonusCoins: number;
            totalWon: number;
            totalLost: number;
            userId: string;
        } | null;
        reputation: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            reliability: number;
            fairPlay: number;
            punctuality: number;
            totalBets: number;
            disputesWon: number;
            disputesLost: number;
            userId: string;
        } | null;
    } & {
        email: string;
        phone: string;
        fullName: string;
        birthDate: Date;
        idPhotoUrl: string | null;
        selfieWithIdUrl: string | null;
        id: string;
        kycStatus: import("generated/prisma").$Enums.KycStatus;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        wallet: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            coins: number;
            bonusCoins: number;
            totalWon: number;
            totalLost: number;
            userId: string;
        } | null;
        reputation: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            reliability: number;
            fairPlay: number;
            punctuality: number;
            totalBets: number;
            disputesWon: number;
            disputesLost: number;
            userId: string;
        } | null;
    } & {
        email: string;
        phone: string;
        fullName: string;
        birthDate: Date;
        idPhotoUrl: string | null;
        selfieWithIdUrl: string | null;
        id: string;
        kycStatus: import("generated/prisma").$Enums.KycStatus;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        email: string;
        phone: string;
        fullName: string;
        birthDate: Date;
        idPhotoUrl: string | null;
        selfieWithIdUrl: string | null;
        id: string;
        kycStatus: import("generated/prisma").$Enums.KycStatus;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
