import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { BorrowBookDto } from '../dto/borrow-book.dto';
import { ReturnBookDto } from '../dto/return-book.dto';
import { borrow_status } from 'generated/prisma/enums';
import { PaginationDto } from 'src/utils/pagination.dto';

@Injectable()
export class BorrowBookService {
  constructor(private readonly prismaService: PrismaService) {}

  async getSpecificBorrowStatus(borrowId: number) {
    const borrowStatus = await this.prismaService.borrow_record.findUnique({
      where: { borrow_record_id: borrowId },
    });

    if (!borrowStatus) throw new NotFoundException('Borrow record not found');
    return { data: borrowStatus };
  }

  async getBookBorrowingRecord(bookId: number, paginationDto: PaginationDto) {
    const book = await this.prismaService.book.findUnique({
      where: { id: bookId },
    });
    if (!book) throw new NotFoundException('No book with this id');

    const bookBorrowed = await this.prismaService.borrow_record.findMany({
      where: { book_id: bookId },
      take: paginationDto.take,
      skip: paginationDto.skip,
    });

    if (!bookBorrowed || bookBorrowed.length === 0)
      throw new NotFoundException("Book doesn't have any records");
    return { data: bookBorrowed };
  }

  async getUserBorrowingRecord(userId: number, paginationDto: PaginationDto) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('No user with this id');

    const userBorrowed = await this.prismaService.borrow_record.findMany({
      where: { user_id: userId },
      take: paginationDto.take,
      skip: paginationDto.skip,
    });

    if (!userBorrowed)
      throw new NotFoundException("User didn't make any borrow requests");
    return { data: userBorrowed };
  }

  async borrowBook(user_id: number, borrowBookDto: BorrowBookDto) {
    return await this.prismaService.$transaction(async (prisma) => {
      // 1. First find the book and ensure it exists and has available copies
      const book = await prisma.book.findUnique({
        where: { id: borrowBookDto.book_id },
      });

      if (!book) throw new NotFoundException('Book not found');
      if (book.available_copies === 0)
        throw new BadRequestException('Book has no available copies');

      // Check if the user already has an active borrow for this book
      const existingBorrow = await prisma.borrow_record.findFirst({
        where: {
          book_id: borrowBookDto.book_id,
          user_id: user_id,
          status: borrow_status.BORROWED,
        },
      });

      if (existingBorrow) {
        throw new ConflictException(
          'User has already borrowed this book and not returned it yet',
        );
      }

      // Update the book's copy count atomically
      await prisma.book.update({
        where: { id: borrowBookDto.book_id },
        data: { available_copies: { decrement: 1 } },
      });

      // Create the borrow record
      return {
        data: await prisma.borrow_record.create({
          data: {
            book_id: borrowBookDto.book_id,
            user_id: user_id,
            status: borrow_status.BORROWED,
            borrow_days: borrowBookDto.days_to_return,
          },
        }),
      };
    });
  }

  async returnBook(user_id: number, returnBookDto: ReturnBookDto) {
    return await this.prismaService.$transaction(async (prisma) => {
      const book = await prisma.book.findUnique({
        where: { id: returnBookDto.book_id },
      });
      if (!book) throw new NotFoundException('No book with this id');

      const borrowRecord = await prisma.borrow_record.findFirst({
        where: {
          book_id: returnBookDto.book_id,
          user_id: user_id,
          status: { in: [borrow_status.BORROWED, borrow_status.LATE] },
        },
      });
      if (!borrowRecord)
        throw new NotFoundException(
          'No active borrow record for this book by this user',
        );

      // Calculate due date
      const dueDate = new Date(borrowRecord.borrow_date);
      dueDate.setDate(dueDate.getDate() + borrowRecord.borrow_days);

      const now = new Date();
      const isLate = now > dueDate;

      // Update the record
      const updated = await prisma.borrow_record.update({
        where: { borrow_record_id: borrowRecord.borrow_record_id },
        data: { status: borrow_status.RETURNED, return_date: now },
      });

      // Increment available copies back
      await prisma.book.update({
        where: { id: returnBookDto.book_id },
        data: { available_copies: { increment: 1 } },
      });

      return {
        data: updated,
        message: isLate
          ? 'User returned the book late'
          : 'User returned the book on time',
      };
    });
  }
}
