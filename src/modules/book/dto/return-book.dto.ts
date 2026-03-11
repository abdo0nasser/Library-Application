import { IsInt, IsNotEmpty } from 'class-validator';

export class ReturnBookDto {
  @IsInt()
  @IsNotEmpty()
  book_id: number;
}
