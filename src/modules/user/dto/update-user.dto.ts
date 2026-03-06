import {
  IsNotEmpty,
  IsOptional,
  IsStrongPassword,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @MinLength(2, { message: 'name is too short' })
  @MaxLength(20, { message: 'name is too big' })
  @IsNotEmpty()
  name: string;

  @IsStrongPassword()
  @IsNotEmpty()
  password: string;

  @Length(18, 75, {
    message: 'age must be greater than 18 and smalled than 75',
  })
  @IsNotEmpty()
  age: number;

  @IsOptional()
  @MinLength(2, { message: 'find a good description for urslf' })
  @MaxLength(128, { message: 'find a smalled description' })
  description: string;
}
