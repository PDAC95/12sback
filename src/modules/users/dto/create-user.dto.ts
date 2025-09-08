import { IsEmail, IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  fullName: string;

  @IsDateString()
  birthDate: string;

  @IsString()
  @IsOptional()
  idPhotoUrl?: string;

  @IsString()
  @IsOptional()
  selfieWithIdUrl?: string;
}