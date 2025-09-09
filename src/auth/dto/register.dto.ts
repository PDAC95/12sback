import { IsEmail, IsString, MinLength, Matches, IsDateString } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^[a-zA-Z0-9_]+$/, { 
    message: 'Username can only contain letters, numbers and underscores' 
  })
  username: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsDateString()
  birthDate: string;
}