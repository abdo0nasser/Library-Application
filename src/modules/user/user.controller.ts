import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import 'dotenv/config';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from 'src/decorators/user-role.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { USER_ROLES } from 'generated/prisma/enums';
import type { JwtPayloadType } from 'src/utils/types';
import { CurrentUser } from 'src/decorators/get-current-user.decorator';
import { PaginationDto } from 'src/utils/pagination.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/utils/multer-config';
import { verifyOwnershipOrAdmin } from 'src/utils/authorization';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles(USER_ROLES.ADMIN)
  @UseGuards(RolesGuard)
  async getAllUser(@Query() paginationDto: PaginationDto) {
    return await this.userService.getAllUsers(paginationDto);
  }

  @Get(':id')
  async getUser(
    @CurrentUser() user: JwtPayloadType,
    @Param('id', ParseIntPipe) userId: number,
  ) {
    verifyOwnershipOrAdmin(user, userId, 'You can only view your own profile');
    return await this.userService.getUser(userId);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('profile', multerConfig))
  async updateUser(
    @CurrentUser() user: JwtPayloadType,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() profilePic?: Express.Multer.File,
  ) {
    verifyOwnershipOrAdmin(user, id, 'You can only update your own profile');
    const profilePath = profilePic?.path ?? null;
    return await this.userService.updateUser(id, updateUserDto, profilePath);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  async deleteUserById(
    @CurrentUser() user: JwtPayloadType,
    @Param('id', ParseIntPipe) userId: number,
  ): Promise<boolean> {
    verifyOwnershipOrAdmin(
      user,
      userId,
      'You can only delete your own profile',
    );
    const deleted = await this.userService.deleteUserById(userId);
    return deleted ? true : false;
  }

  @Delete()
  @UseGuards(RolesGuard)
  async deleteCurrentUser(
    @CurrentUser() payload: JwtPayloadType,
  ): Promise<boolean> {
    const deleted = await this.userService.deleteCurrentUser(payload);
    return deleted;
  }
}
