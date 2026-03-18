import {
  IsEmail,
  IsNotEmpty,
  IsStrongPassword,
  MaxLength,
} from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @MaxLength(20)
  @IsStrongPassword()
  @IsNotEmpty()
  password: string;
}
