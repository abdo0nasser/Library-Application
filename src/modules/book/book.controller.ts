import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { BookService } from './book.service';
import { AddBookDto } from './dto/add-book.dto';
import { AuthGuard } from 'src/guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post()
  async createBook(@Body() addBookDto: AddBookDto) {
    return await this.bookService.addBook(addBookDto);
  }

  @Put(':id')
  async updateBook(
    @Param('id', ParseIntPipe) bookId: number,
    @Body() updateBookDto: AddBookDto,
  ) {
    return await this.bookService.updateBook(bookId, updateBookDto);
  }

  @Delete(':id')
  async deleteBook(@Param('id', ParseIntPipe) bookId: number) {
    return await this.bookService.deleteBook(bookId);
  }
}
