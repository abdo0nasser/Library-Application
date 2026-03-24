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
} from '@nestjs/common';
import { BookService } from './book.service';
import { AddBookDto } from './dto/add-book.dto';
import { CurrentUser } from 'src/decorators/get-current-user.decorator';
import type { JwtPayloadType } from 'src/utils/types';
import { PaginationDto } from 'src/utils/pagination.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get()
  @ApiOperation({ summary: 'Get all books' })
  @ApiResponse({ status: 200, description: 'List of books' })
  async getBooks(@Query() paginationDto: PaginationDto) {
    return await this.bookService.getAllBooks(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get book by ID' })
  @ApiResponse({ status: 200, description: 'Book details' })
  async getBookById(@Param('id', ParseIntPipe) id: number) {
    return await this.bookService.getBookById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Add a new book' })
  @ApiResponse({ status: 201, description: 'Book added' })
  async createBook(
    @CurrentUser() user: JwtPayloadType,
    @Body() addBookDto: AddBookDto,
  ) {
    return await this.bookService.addBook(user, addBookDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update book details' })
  @ApiResponse({ status: 200, description: 'Book updated' })
  async updateBook(
    @CurrentUser() user: JwtPayloadType,
    @Param('id', ParseIntPipe) bookId: number,
    @Body() updateBookDto: UpdateBookDto,
  ) {
    return await this.bookService.updateBook(user, bookId, updateBookDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a book' })
  @ApiResponse({ status: 200, description: 'Book deleted' })
  async deleteBook(
    @CurrentUser() user: JwtPayloadType,
    @Param('id', ParseIntPipe) bookId: number,
  ) {
    return await this.bookService.deleteBook(user, bookId);
  }
}
