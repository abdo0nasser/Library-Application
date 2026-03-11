import { IsInt, IsNotEmpty, Max, Min } from 'class-validator';

export class BorrowBookDto {
  @IsInt()
  @IsNotEmpty()
  book_id: number;

  @IsInt()
  @Max(15)
  @Min(1)
  @IsNotEmpty()
  days_to_return: number;
}
