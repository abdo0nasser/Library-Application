import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { BorrowBookService } from './borrow_book.service';
import { CurrentUser } from 'src/decorators/get-current-user.decorator';
import type { JwtPayloadType } from 'src/utils/types';

@Controller('borrow-book')
export class BorrowBookController {
  constructor(private readonly borrowBookService: BorrowBookService) {}

  @Get(':id')
  async getBookBorrowingRecord(@Param('id', ParseIntPipe) id: number) {
    return await this.borrowBookService.getBookBorrowingRecord(id);
  }

  @Post(':id/borrow')
  async borrowBook(
    @CurrentUser() user: JwtPayloadType,
    @Param('id', ParseIntPipe) book_id: number,
    @Body('days_to_return', ParseIntPipe) days_to_return: number,
  ) {
    return await this.borrowBookService.borrowBook(user.sub, {
      book_id,
      days_to_return,
    });
  }

  @Put(':id/return')
  async returnBook(
    @CurrentUser() user: JwtPayloadType,
    @Param('id', ParseIntPipe) book_id: number,
  ) {
    return await this.borrowBookService.returnBook(user.sub, { book_id });
  }

  @Get('user-history/:id')
  async getUserBorrowingHistory(@Param('id', ParseIntPipe) userId: number) {
    return await this.borrowBookService.getUserBorrowingRecord(userId);
  }

  @Get('book-history/:id')
  async getBookBorrowingHistory(@Param('id', ParseIntPipe) bookId: number) {
    return await this.borrowBookService.getBookBorrowingRecord(bookId);
  }
}
