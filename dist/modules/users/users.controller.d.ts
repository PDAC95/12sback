import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<{
        wallet: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            coins: number;
            bonusCoins: number;
            totalWon: number;
            totalLost: number;
        } | null;
        reputation: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            reliability: number;
            fairPlay: number;
            punctuality: number;
            totalBets: number;
            disputesWon: number;
            disputesLost: number;
        } | null;
    } & {
        email: string;
        username: string;
        auth0Id: string;
        birthDate: Date;
        emailVerified: boolean;
        termsAcceptedAt: Date;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<({
        wallet: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            coins: number;
            bonusCoins: number;
            totalWon: number;
            totalLost: number;
        } | null;
        reputation: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            reliability: number;
            fairPlay: number;
            punctuality: number;
            totalBets: number;
            disputesWon: number;
            disputesLost: number;
        } | null;
    } & {
        email: string;
        username: string;
        auth0Id: string;
        birthDate: Date;
        emailVerified: boolean;
        termsAcceptedAt: Date;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: string): Promise<{
        wallet: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            coins: number;
            bonusCoins: number;
            totalWon: number;
            totalLost: number;
        } | null;
        reputation: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            reliability: number;
            fairPlay: number;
            punctuality: number;
            totalBets: number;
            disputesWon: number;
            disputesLost: number;
        } | null;
    } & {
        email: string;
        username: string;
        auth0Id: string;
        birthDate: Date;
        emailVerified: boolean;
        termsAcceptedAt: Date;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        wallet: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            coins: number;
            bonusCoins: number;
            totalWon: number;
            totalLost: number;
        } | null;
        reputation: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            reliability: number;
            fairPlay: number;
            punctuality: number;
            totalBets: number;
            disputesWon: number;
            disputesLost: number;
        } | null;
    } & {
        email: string;
        username: string;
        auth0Id: string;
        birthDate: Date;
        emailVerified: boolean;
        termsAcceptedAt: Date;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        email: string;
        username: string;
        auth0Id: string;
        birthDate: Date;
        emailVerified: boolean;
        termsAcceptedAt: Date;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
