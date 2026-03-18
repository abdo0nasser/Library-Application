import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsStrongPassword,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @MinLength(2, { message: 'name is too short' })
  @MaxLength(20, { message: 'name is too big' })
  @IsNotEmpty()
  name: string;

  @IsStrongPassword()
  @IsNotEmpty()
  password: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Type(() => Number)
  @IsInt()
  @Min(18, {
    message: 'age must be 18+',
  })
  @Max(75, {
    message: 'age must be 75 or less',
  })
  @IsNotEmpty()
  age: number;

  @IsOptional()
  @MinLength(2, { message: 'find a good description for urslf' })
  @MaxLength(128, { message: 'find a smalled description' })
  description: string;
}
