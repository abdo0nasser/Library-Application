import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BorrowBookService } from './borrow_book.service';
import { CurrentUser } from 'src/decorators/get-current-user.decorator';
import type { JwtPayloadType } from 'src/utils/types';
import { PaginationDto } from 'src/utils/pagination.dto';
import { USER_ROLES } from 'generated/prisma/enums';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/user-role.decorator';
import { BorrowBookDto } from '../dto/borrow-book.dto';
import { verifyOwnershipOrAdmin } from 'src/utils/authorization';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('borrow-book')
export class BorrowBookController {
  constructor(private readonly borrowBookService: BorrowBookService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get specific borrowing record status' })
  @ApiResponse({ status: 200, description: 'Borrowing status' })
  async getSpecificBookBorrowingRecord(
    @CurrentUser() user: JwtPayloadType,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.borrowBookService.getSpecificBorrowStatus(user, id);
  }

  @Get('user-history/:id')
  @ApiOperation({ summary: 'Get borrowing history of a user' })
  @ApiResponse({ status: 200, description: 'User borrowing history' })
  async getUserBorrowingHistory(
    @CurrentUser() user: JwtPayloadType,
    @Param('id', ParseIntPipe) userId: number,
    @Query() paginationDto: PaginationDto,
  ) {
    verifyOwnershipOrAdmin(
      user,
      userId,
      'You can only view your own borrowing history',
    );
    return await this.borrowBookService.getUserBorrowingRecord(
      user,
      userId,
      paginationDto,
    );
  }

  @UseGuards(RolesGuard)
  @Roles(USER_ROLES.ADMIN)
  @Get('book-history/:id')
  @ApiOperation({ summary: 'Get borrowing history of a book (Admin only)' })
  @ApiResponse({ status: 200, description: 'Book borrowing history' })
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
  @ApiOperation({ summary: 'Borrow a book' })
  @ApiResponse({ status: 201, description: 'Book borrowed successfully' })
  async borrowBook(
    @CurrentUser() user: JwtPayloadType,
    @Param('id', ParseIntPipe) book_id: number,
    @Body() borrowBookDto: BorrowBookDto,
  ) {
    return await this.borrowBookService.borrowBook(
      user.sub,
      book_id,
      borrowBookDto,
    );
  }

  @Put(':id/return')
  @ApiOperation({ summary: 'Return a borrowed book' })
  @ApiResponse({ status: 200, description: 'Book returned successfully' })
  async returnBook(
    @CurrentUser() user: JwtPayloadType,
    @Param('id', ParseIntPipe) book_id: number,
  ) {
    return await this.borrowBookService.returnBook(user.sub, { book_id });
  }
}
