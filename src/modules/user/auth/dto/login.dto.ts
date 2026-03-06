import { IsEmail, IsNotEmpty, IsStrongPassword, Max } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Max(20)
  @IsStrongPassword()
  @IsNotEmpty()
  password: string;
}
