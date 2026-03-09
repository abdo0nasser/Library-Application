import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { BookService } from './book.service';
import { AddBookDto } from './dto/add-book.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { Roles } from 'src/decorators/user-role.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { USER_ROLES } from 'generated/prisma/enums';

@Roles('ADMIN')
@UseGuards(AuthGuard, RolesGuard)
@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get()
  async getBooks() {
    return await this.bookService.getAllBooks();
  }

  @Roles(USER_ROLES.NORMAL, USER_ROLES.ADMIN)
  @Get(':id')
  async getBookById(@Param('id', ParseIntPipe) id: number) {
    return await this.bookService.getBookById(id);
  }

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
