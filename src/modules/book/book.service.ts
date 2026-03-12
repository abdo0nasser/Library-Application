import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddBookDto } from './dto/add-book.dto';
import { JwtPayloadType } from 'src/utils/types';
import { PaginationDto } from 'src/utils/pagination.dto';

@Injectable()
export class BookService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllBooks(paginationDto: PaginationDto) {
    console.log(paginationDto);

    const books = await this.prismaService.book.findMany({
      take: paginationDto.take,
      skip: paginationDto.skip,
    });
    return books;
  }

  async getBookById(id: number) {
    const book = await this.prismaService.book.findFirst({ where: { id } });
    if (!book) throw new NotFoundException('Book not found');
    return book;
  }

  async addBook(user: JwtPayloadType, addBookDto: AddBookDto) {
    if (addBookDto.total_copies < addBookDto.available_copies)
      throw new BadRequestException(
        'Available copies must be lower than or equal to total copies',
      );

    const book = await this.prismaService.book.create({
      data: { user_id: user.sub, ...addBookDto },
    });
    return book;
  }

  async updateBook(bookId: number, updateBookDto: AddBookDto) {
    if (updateBookDto.total_copies < updateBookDto.available_copies)
      throw new BadRequestException(
        'Available copies must be lower than or equal to total copies',
      );

    try {
      const book = await this.prismaService.book.update({
        where: { id: bookId },
        data: updateBookDto,
      });
      return book;
    } catch (error: any) {
      if (error.code === 'P2025') throw new NotFoundException('Book not found');
      throw error;
    }
  }

  async deleteBook(bookId: number) {
    try {
      const deletedBook = await this.prismaService.book.delete({
        where: { id: bookId },
      });
      return deletedBook;
    } catch (error: any) {
      if (error.code === 'P2025') throw new NotFoundException('Book not found');
      throw error;
    }
  }
}
