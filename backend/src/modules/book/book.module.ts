import { Module } from '@nestjs/common';
import { BookController } from './book.controller';
import { BookService } from './book.service';
import { BorrowBookController } from './borrow_book/borrow_book.controller';
import { BorrowBookService } from './borrow_book/borrow_book.service';

@Module({
  controllers: [BookController, BorrowBookController],
  providers: [BookService, BorrowBookService],
})
export class BookModule {}
