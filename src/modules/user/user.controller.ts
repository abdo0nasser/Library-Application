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
  async getUser(@Param('id', ParseIntPipe) userId: number) {
    return await this.userService.getUser(userId);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('profile', multerConfig))
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() profilePic?: Express.Multer.File,
  ) {
    const profilePath = profilePic?.path ?? null;
    return await this.userService.updateUser(id, updateUserDto, profilePath);
  }

  @Delete(':id')
  @Roles(USER_ROLES.ADMIN)
  @UseGuards(RolesGuard)
  async deleteUserById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<boolean> {
    const deleted = await this.userService.deleteUserById(id);
    return deleted ? true : false;
  }

  @Delete()
  @Roles(USER_ROLES.ADMIN, USER_ROLES.NORMAL)
  @UseGuards(RolesGuard)
  async deleteCurrentUser(
    @CurrentUser() payload: JwtPayloadType,
  ): Promise<boolean> {
    const deleted = await this.userService.deleteCurrentUser(payload);
    return deleted;
  }
}
