import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import 'dotenv/config';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from 'src/decorators/user-role.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { USER_ROLES } from 'generated/prisma/enums';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles(USER_ROLES.ADMIN)
  @UseGuards(RolesGuard)
  async getAllUser() {
    return await this.userService.getAllUsers();
  }

  @Get(':id')
  async getUser(@Param('id', ParseIntPipe) userId: number) {
    return await this.userService.getUser(userId);
  }

  @Put(':id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    await this.userService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number): Promise<boolean> {
    const deleted = await this.userService.deleteUser(id);
    return deleted ? true : false;
  }
}
