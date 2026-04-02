import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { hash } from 'src/utils/argon';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtPayloadType } from 'src/utils/types';
import { PaginationDto } from 'src/utils/pagination.dto';
import { AppLoggerService } from 'src/modules/logger/logger.service';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: AppLoggerService,
  ) {
    this.logger.setContext(UserService.name);
  }

  async getAllUsers(paginationDto: PaginationDto) {
    this.logger.log(
      `Fetching users — take=${paginationDto.take}, skip=${paginationDto.skip}`,
    );
    const users = await this.prismaService.user.findMany({
      omit: { password: true },
      take: paginationDto.take,
      skip: paginationDto.skip,
    });
    return users;
  }

  async getUser(userId: number) {
    this.logger.log(`Fetching user: id=${userId}`);
    const user = await this.prismaService.user.findFirst({
      where: { id: userId },
      omit: { password: true },
    });

    if (!user) throw new NotFoundException('No user with this id');
    return user;
  }

  async updateUser(
    id: number,
    updateUserDto: UpdateUserDto,
    profilePath: string | null,
  ) {
    this.logger.log(`Updating user: id=${id}`);
    const user = await this.prismaService.user.findFirst({
      where: { id },
    });
    if (!user) throw new NotFoundException('No user with this id');

    const updateData: Prisma.userUpdateInput = {};
    if (updateUserDto.age !== undefined) updateData.age = updateUserDto.age;
    if (updateUserDto.description !== undefined)
      updateData.description = updateUserDto.description;
    if (updateUserDto.name !== undefined) updateData.name = updateUserDto.name;
    if (profilePath !== null) updateData.user_profile = profilePath;
    if (updateUserDto.password)
      updateData.password = await hash(updateUserDto.password);

    if (Object.keys(updateData).length === 0) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }

    const updated = await this.prismaService.user.update({
      where: { id },
      data: updateData,
      omit: { password: true },
    });
    this.logger.log(
      `User updated: id=${id}, fields=[${Object.keys(updateData).join(', ')}]`,
    );
    return updated;
  }

  async deleteUserById(id: number) {
    this.logger.log(`Deleting user: id=${id}`);
    const user = await this.prismaService.user.findFirst({ where: { id } });
    if (!user) throw new NotFoundException('No user with this id');
    const deleted = await this.prismaService.user.delete({
      where: { id },
      omit: { password: true },
    });
    this.logger.log(`User deleted: id=${id}`);
    return deleted ?? false;
  }

  async deleteCurrentUser(userPayload: JwtPayloadType) {
    this.logger.log(`User self-deleting: id=${userPayload.sub}`);
    const user = await this.prismaService.user.findFirst({
      where: { id: userPayload.sub },
      omit: { password: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const result = await this.prismaService.user.delete({
      where: { id: userPayload.sub },
      omit: { password: true },
    });
    this.logger.log(`User self-deleted: id=${userPayload.sub}`);
    return result ? true : false;
  }
}
