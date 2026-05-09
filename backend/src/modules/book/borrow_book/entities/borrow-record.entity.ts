import { ApiProperty } from '@nestjs/swagger';
import { borrow_record } from 'src/generated/prisma/client';
import { borrow_status } from 'src/generated/prisma/enums';

export class BorrowRecordEntity implements borrow_record {
  @ApiProperty()
  borrow_record_id: number;
  @ApiProperty()
  borrow_date: Date;
  @ApiProperty()
  borrow_days: number;
  @ApiProperty({ nullable: true })
  return_date: Date | null;
  @ApiProperty({ enum: borrow_status })
  status: borrow_status;
  @ApiProperty()
  user_id: number;
  @ApiProperty()
  book_id: number;
}
