import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsStrongPassword,
  MaxLength,
  MinLength,
  Min,
  Max,
} from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'John updated', minLength: 2, maxLength: 20 })
  @Transform(({ value }) => (value === '' ? undefined : value))
  @MinLength(2, { message: 'name is too short' })
  @MaxLength(20, { message: 'name is too big' })
  @IsOptional()
  name: string;

  @ApiPropertyOptional({ example: 'NewPassword123!' })
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsStrongPassword()
  @IsOptional()
  password: string;

  @ApiPropertyOptional({ example: 30, minimum: 18, maximum: 75 })
  @Transform(({ value }) => (value === '' ? undefined : Number(value)))
  @Min(18, { message: 'age must be between 18 and 75' })
  @Max(75, { message: 'age must be between 18 and 75' })
  @IsOptional()
  age: number;

  @ApiPropertyOptional({
    example: 'Updated description',
    minLength: 2,
    maxLength: 128,
  })
  @Transform(({ value }) => (value === '' ? undefined : value))
  @MinLength(2, { message: 'find a good description for urslf' })
  @MaxLength(128, { message: 'find a smalled description' })
  @IsOptional()
  description: string;
}
