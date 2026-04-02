import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddBookDto } from './dto/add-book.dto';
import { JwtPayloadType, PaginatedResult } from 'src/utils/types';
import { book } from 'generated/prisma/client';
import { PaginationDto } from 'src/utils/pagination.dto';
import { verifyOwnershipOrAdmin } from 'src/utils/authorization';
import { UpdateBookDto } from './dto/update-book.dto';
import { AppLoggerService } from 'src/modules/logger/logger.service';

@Injectable()
export class BookService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: AppLoggerService,
  ) {
    this.logger.setContext(BookService.name);
  }

  async getAllBooks(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<book>> {
    this.logger.log(
      `Fetching books — take=${paginationDto.take}, skip=${paginationDto.skip}`,
    );
    const books = await this.prismaService.book.findMany({
      take: paginationDto.take,
      skip: paginationDto.skip,
    });
    const count = await this.prismaService.book.count();
    return { 
      data: books, 
      metadata: paginationDto.getMeta(count, books.length) 
    };
  }

  async getBookById(id: number) {
    this.logger.log(`Fetching book: id=${id}`);
    const book = await this.prismaService.book.findFirst({ where: { id } });
    if (!book) throw new NotFoundException('Book not found');
    return book;
  }

  async addBook(
    user: JwtPayloadType,
    addBookDto: AddBookDto,
  ) {
    this.logger.log(`User id=${user.sub} adding book: "${addBookDto.title}"`);
    if (addBookDto.total_copies < addBookDto.available_copies)
      throw new BadRequestException(
        'Available copies must be lower than or equal to total copies',
      );

    const book = await this.prismaService.book.create({
      data: { user_id: user.sub, ...addBookDto },
    });
    this.logger.log(`Book created: id=${book.id}, title="${book.title}"`);
    return book;
  }

  async updateBook(
    user: JwtPayloadType,
    bookId: number,
    updateBookDto: UpdateBookDto,
  ) {
    this.logger.log(`User id=${user.sub} updating book: id=${bookId}`);
    if (updateBookDto.total_copies < updateBookDto.available_copies)
      throw new BadRequestException(
        'Available copies must be lower than or equal to total copies',
      );

    const existingBook = await this.prismaService.book.findUnique({
      where: { id: bookId },
    });
    if (!existingBook) throw new NotFoundException('Book not found');

    verifyOwnershipOrAdmin(
      user,
      existingBook.user_id,
      'You can only update your own books',
    );

    const book = await this.prismaService.book.update({
      where: { id: bookId },
      data: updateBookDto,
    });
    this.logger.log(`Book updated: id=${book.id}`);
    return book;
  }

  async deleteBook(
    user: JwtPayloadType,
    bookId: number,
  ) {
    this.logger.log(`User id=${user.sub} deleting book: id=${bookId}`);
    const existingBook = await this.prismaService.book.findUnique({
      where: { id: bookId },
    });
    if (!existingBook) throw new NotFoundException('Book not found');

    verifyOwnershipOrAdmin(
      user,
      existingBook.user_id,
      'You can only delete your own books',
    );

    const deletedBook = await this.prismaService.book.delete({
      where: { id: bookId },
    });
    this.logger.log(`Book deleted: id=${bookId}`);
    return deletedBook;
  }
}
