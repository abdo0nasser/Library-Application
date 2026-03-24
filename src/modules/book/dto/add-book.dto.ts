import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Length, Max, Min } from 'class-validator';

export class AddBookDto {
  @ApiProperty({ example: 'The Catcher in the Rye', minLength: 2, maxLength: 30 })
  @IsString()
  @Length(2, 30)
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'J.D. Salinger', minLength: 2, maxLength: 30 })
  @IsString()
  @Length(2, 30)
  @IsNotEmpty()
  author: string;

  @ApiProperty({ example: 10, minimum: 1, maximum: 30 })
  @IsInt()
  @Min(1)
  @Max(30)
  @IsNotEmpty()
  total_copies: number;

  @ApiProperty({ example: 5, minimum: 1, maximum: 30 })
  @IsInt()
  @Min(1)
  @Max(30)
  @IsNotEmpty()
  available_copies: number;
}
