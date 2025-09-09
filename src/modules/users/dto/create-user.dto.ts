import { IsEmail, IsString, IsDateString, IsOptional, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  username: string;

  @IsString()
  auth0Id: string;

  @IsDateString()
  birthDate: string;

  @IsBoolean()
  @IsOptional()
  emailVerified?: boolean;

  @IsDateString()
  @IsOptional()
  termsAcceptedAt?: string;
}