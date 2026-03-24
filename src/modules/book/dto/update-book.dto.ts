import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class UpdateBookDto {
  @ApiPropertyOptional({
    example: 'The Catcher in the Rye',
    minLength: 2,
    maxLength: 30,
  })
  @IsString()
  @Length(2, 30)
  @IsOptional()
  title: string;

  @ApiPropertyOptional({
    example: 'J.D. Salinger',
    minLength: 2,
    maxLength: 30,
  })
  @IsString()
  @Length(2, 30)
  @IsOptional()
  author: string;

  @ApiPropertyOptional({ example: 10, minimum: 1, maximum: 30 })
  @IsInt()
  @Min(1)
  @Max(30)
  @IsOptional()
  total_copies: number;

  @ApiPropertyOptional({ example: 5, minimum: 1, maximum: 30 })
  @IsInt()
  @Min(1)
  @Max(30)
  @IsOptional()
  available_copies: number;
}
