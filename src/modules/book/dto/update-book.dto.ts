import { IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class UpdateBookDto {
  @IsString()
  @Length(2, 30)
  @IsOptional()
  title: string;

  @IsString()
  @Length(2, 30)
  @IsOptional()
  author: string;

  @IsInt()
  @Min(1)
  @Max(30)
  @IsOptional()
  total_copies: number;

  @IsInt()
  @Min(1)
  @Max(30)
  @IsOptional()
  available_copies: number;
}
