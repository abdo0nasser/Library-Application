import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class ReturnBookDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  book_id: number;
}
