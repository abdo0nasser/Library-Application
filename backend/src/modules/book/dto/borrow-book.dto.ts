import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Max, Min } from 'class-validator';

export class BorrowBookDto {
  @ApiProperty({
    example: 7,
    minimum: 1,
    maximum: 15,
    description: 'Number of days to borrow the book',
  })
  @IsInt()
  @Max(15)
  @Min(1)
  @IsNotEmpty()
  days_to_return: number;
}
