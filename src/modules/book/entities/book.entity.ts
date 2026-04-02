import { ApiProperty } from '@nestjs/swagger';
import { book } from 'generated/prisma/client';

export class BookEntity implements book {
  @ApiProperty()
  id: number;
  @ApiProperty()
  title: string;
  @ApiProperty()
  author: string;
  @ApiProperty()
  total_copies: number;
  @ApiProperty()
  available_copies: number;
  @ApiProperty()
  user_id: number;
}
