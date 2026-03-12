import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { BorrowBookService } from './borrow_book.service';
import { CurrentUser } from 'src/decorators/get-current-user.decorator';
import type { JwtPayloadType } from 'src/utils/types';
import { PaginationDto } from 'src/utils/pagination.dto';

@Controller('borrow-book')
export class BorrowBookController {
  constructor(private readonly borrowBookService: BorrowBookService) {}

  @Get(':id')
  async getSpecificBookBorrowingRecord(@Param('id', ParseIntPipe) id: number) {
    return await this.borrowBookService.getSpecificBorrowStatus(id);
  }

  @Get('user-history/:id')
  async getUserBorrowingHistory(
    @Param('id', ParseIntPipe) userId: number,
    @Query() paginationDto: PaginationDto,
  ) {
    return await this.borrowBookService.getUserBorrowingRecord(
      userId,
      paginationDto,
    );
  }

  @Get('book-history/:id')
  async getBookBorrowingHistory(
    @Param('id', ParseIntPipe) bookId: number,
    @Query() paginationDto: PaginationDto,
  ) {
    return await this.borrowBookService.getBookBorrowingRecord(
      bookId,
      paginationDto,
    );
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
}
