import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { hash } from 'src/utils/argon';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtPayloadType } from 'src/utils/types';
import { PaginationDto } from 'src/utils/pagination.dto';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}
  async getAllUsers(paginationDto: PaginationDto) {
    const users = await this.prismaService.user.findMany({
      omit: { password: true },
      take: paginationDto.take,
      skip: paginationDto.skip,
    });
    return users;
  }

  async getUser(userId: number) {
    const user = await this.prismaService.user.findFirst({
      where: { id: userId },
      omit: { password: true },
    });

    if (!user) throw new NotFoundException('No user with this id');
    return user;
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.prismaService.user.findFirst({
      where: { id },
    });
    if (!user) throw new NotFoundException('No user with this id');
    user.age = updateUserDto.age ?? user.age;
    user.description = updateUserDto.description ?? user.description;
    user.name = updateUserDto.name ?? user.name;

    user.password = (await hash(updateUserDto.password)) ?? user.password;

    return await this.prismaService.user.update({
      where: { id },
      data: user,
      omit: { password: true },
    });
  }

  async deleteUserById(id: number) {
    const user = await this.prismaService.user.findFirst({ where: { id } });
    if (!user) throw new NotFoundException('No user with this id');
    return (
      (await this.prismaService.user.delete({
        where: { id },
        omit: { password: true },
      })) ?? false
    );
  }

  async deleteCurrentUser(userPayload: JwtPayloadType) {
    const user = await this.prismaService.user.findFirst({
      where: { id: userPayload.sub },
      omit: { password: true },
    });
    if (!user) throw new NotFoundException('User not found');

    return (await this.prismaService.user.delete({
      where: { id: userPayload.sub },
      omit: { password: true },
    }))
      ? true
      : false;
  }
}
