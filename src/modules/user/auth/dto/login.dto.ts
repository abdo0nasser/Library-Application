import {
  IsEmail,
  IsNotEmpty,
  IsStrongPassword,
  Length,
  Max,
} from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Length(8, 20)
  @IsStrongPassword()
  @IsNotEmpty()
  password: string;
}
