import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // Create user with wallet and reputation
    const userData: any = {
      ...createUserDto,
      birthDate: new Date(createUserDto.birthDate),
      emailVerified: createUserDto.emailVerified ?? false,
      termsAcceptedAt: createUserDto.termsAcceptedAt ? new Date(createUserDto.termsAcceptedAt) : new Date(),
      wallet: {
        create: {
          coins: 100, // Welcome bonus
        },
      },
      reputation: {
        create: {},
      },
    };

    return this.prisma.user.create({
      data: userData,
      include: {
        wallet: true,
        reputation: true,
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      include: {
        wallet: true,
        reputation: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        wallet: true,
        reputation: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const data: any = { ...updateUserDto };
    if (data.birthDate) {
      data.birthDate = new Date(data.birthDate);
    }

    return this.prisma.user.update({
      where: { id },
      data,
      include: {
        wallet: true,
        reputation: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}