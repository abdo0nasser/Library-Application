import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BookService } from './book.service';
import { AddBookDto } from './dto/add-book.dto';
import { Roles } from 'src/decorators/user-role.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { USER_ROLES } from 'generated/prisma/enums';
import { CurrentUser } from 'src/decorators/get-current-user.decorator';
import type { JwtPayloadType } from 'src/utils/types';
import { PaginationDto } from 'src/utils/pagination.dto';

@Roles('ADMIN')
@UseGuards(RolesGuard)
@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get()
  async getBooks(@Query() paginationDto: PaginationDto) {
    return await this.bookService.getAllBooks(paginationDto);
  }

  @Roles(USER_ROLES.NORMAL, USER_ROLES.ADMIN)
  @Get(':id')
  async getBookById(@Param('id', ParseIntPipe) id: number) {
    return await this.bookService.getBookById(id);
  }

  @Post()
  async createBook(
    @CurrentUser() user: JwtPayloadType,
    @Body() addBookDto: AddBookDto,
  ) {
    return await this.bookService.addBook(user, addBookDto);
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
