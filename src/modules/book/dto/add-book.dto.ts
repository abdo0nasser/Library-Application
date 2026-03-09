import { IsInt, IsNotEmpty, IsString, Length, Max, Min } from 'class-validator';

export class AddBookDto {
  @IsString()
  @Length(2, 30)
  @IsNotEmpty()
  title: string;

  @IsString()
  @Length(2, 30)
  @IsNotEmpty()
  author: string;

  @IsInt()
  @Min(1)
  @Max(30)
  @IsNotEmpty()
  total_copies: number;

  @IsInt()
  @Min(1)
  @Max(30)
  @IsNotEmpty()
  available_copies: number;
}
