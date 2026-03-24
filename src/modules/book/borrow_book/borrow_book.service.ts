import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtPayloadType } from 'src/utils/types';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { BorrowBookDto } from '../dto/borrow-book.dto';
import { ReturnBookDto } from '../dto/return-book.dto';
import { borrow_status } from 'generated/prisma/enums';
import { PaginationDto } from 'src/utils/pagination.dto';
import { verifyOwnershipOrAdmin } from 'src/utils/authorization';
import { AppLoggerService } from 'src/modules/logger/logger.service';

@Injectable()
export class BorrowBookService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: AppLoggerService,
  ) {
    this.logger.setContext(BorrowBookService.name);
  }

  async getSpecificBorrowStatus(userPayload: JwtPayloadType, borrowId: number) {
    this.logger.log(`Fetching borrow record: id=${borrowId}`);
    const borrowStatus = await this.prismaService.borrow_record.findUnique({
      where: { borrow_record_id: borrowId },
    });

    if (!borrowStatus) throw new NotFoundException('Borrow record not found');
    verifyOwnershipOrAdmin(
      userPayload,
      borrowStatus.user_id,
      'You are not authorized to view this record',
    );
    return { data: borrowStatus };
  }

  async getBookBorrowingRecord(bookId: number, paginationDto: PaginationDto) {
    this.logger.log(`Fetching borrowing records for book: id=${bookId}`);
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

  async getUserBorrowingRecord(
    userPayload: JwtPayloadType,
    userId: number,
    paginationDto: PaginationDto,
  ) {
    this.logger.log(`Fetching borrowing records for user: id=${userId}`);
    verifyOwnershipOrAdmin(
      userPayload,
      userId,
      'You can only view your own borrowing history',
    );
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

  async borrowBook(
    user_id: number,
    book_id: number,
    borrowBookDto: BorrowBookDto,
  ) {
    this.logger.log(`User id=${user_id} borrowing book: id=${book_id}`);
    return await this.prismaService.$transaction(async (prisma) => {
      const book = await prisma.book.findUnique({
        where: { id: book_id },
      });

      if (!book) throw new NotFoundException('Book not found');
      if (book.available_copies === 0)
        throw new BadRequestException('Book has no available copies');

      const existingBorrow = await prisma.borrow_record.findFirst({
        where: {
          book_id: book_id,
          user_id: user_id,
          status: borrow_status.BORROWED,
        },
      });

      if (existingBorrow) {
        throw new ConflictException(
          'User has already borrowed this book and not returned it yet',
        );
      }

      const result = await prisma.book.updateMany({
        where: { id: book_id, available_copies: { gt: 0 } },
        data: { available_copies: { decrement: 1 } },
      });

      if (result.count === 0) {
        throw new BadRequestException('Book has no available copies left');
      }

      const record = await prisma.borrow_record.create({
        data: {
          book_id: book_id,
          user_id: user_id,
          status: borrow_status.BORROWED,
          borrow_days: borrowBookDto.days_to_return,
        },
      });

      this.logger.log(
        `Book borrowed: record_id=${record.borrow_record_id}, user_id=${user_id}, book_id=${book_id}, days=${borrowBookDto.days_to_return}`,
      );

      return { data: record };
    });
  }

  async returnBook(user_id: number, returnBookDto: ReturnBookDto) {
    this.logger.log(`User id=${user_id} returning book: id=${returnBookDto.book_id}`);
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

      const dueDate = new Date(borrowRecord.borrow_date);
      dueDate.setDate(dueDate.getDate() + borrowRecord.borrow_days);

      const now = new Date();
      const isLate = now > dueDate;

      const updated = await prisma.borrow_record.update({
        where: { borrow_record_id: borrowRecord.borrow_record_id },
        data: { status: borrow_status.RETURNED, return_date: now },
      });

      await prisma.book.update({
        where: { id: returnBookDto.book_id },
        data: { available_copies: { increment: 1 } },
      });

      this.logger.log(
        `Book returned: record_id=${borrowRecord.borrow_record_id}, user_id=${user_id}, book_id=${returnBookDto.book_id}${isLate ? ' (LATE)' : ''}`,
      );

      return {
        data: updated,
        message: isLate
          ? 'User returned the book late'
          : 'User returned the book on time',
      };
    });
  }
}
