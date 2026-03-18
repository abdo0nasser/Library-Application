import {
  IsOptional,
  IsStrongPassword,
  MaxLength,
  MinLength,
  Min,
  Max,
} from 'class-validator';

export class UpdateUserDto {
  @MinLength(2, { message: 'name is too short' })
  @MaxLength(20, { message: 'name is too big' })
  @IsOptional()
  name: string;

  @IsStrongPassword()
  @IsOptional()
  password: string;

  @Min(18, { message: 'age must be 18 or older' })
  @Max(75, { message: 'age must be 75 or younger' })
  @IsOptional()
  age: number;

  @MinLength(2, { message: 'find a good description for urslf' })
  @MaxLength(128, { message: 'find a smalled description' })
  @IsOptional()
  description: string;
}
