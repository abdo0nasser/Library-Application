import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({ example: 'John Doe', minLength: 2, maxLength: 20 })
  @MinLength(2, { message: 'name is too short' })
  @MaxLength(20, { message: 'name is too big' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Password123!' })
  @IsStrongPassword()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 25, minimum: 18, maximum: 75 })
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

  @ApiPropertyOptional({
    example: 'I love reading books',
    minLength: 2,
    maxLength: 128,
  })
  @IsOptional()
  @MinLength(2, { message: 'find a good description for urslf' })
  @MaxLength(128, { message: 'find a smalled description' })
  description: string;
}
