import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { hash } from 'src/utils/argon';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtPayloadType } from 'src/utils/types';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}
  async getAllUsers() {
    const users = await this.prismaService.user.findMany();
    return users;
  }

  async getUser(userId: number) {
    const user = await this.prismaService.user.findFirst({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException();
    return user;
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.prismaService.user.findFirst({ where: { id } });
    if (!user) throw new NotFoundException('no user with this Id');
    user.age = updateUserDto.age ?? user.age;
    user.description = updateUserDto.description ?? user.description;
    user.name = updateUserDto.name ?? user.name;
    user.password = (await hash(updateUserDto.password)) ?? user.password;
    return await this.prismaService.user.update({
      where: { id },
      data: user,
    });
  }

  async deleteUserById(id: number) {
    const user = await this.prismaService.user.findFirst({ where: { id } });
    if (!user) throw new NotFoundException('no user with this Id');
    return (await this.prismaService.user.delete({ where: { id } })) ?? false;
  }

  async deleteCurrentUser(userPayload: JwtPayloadType) {
    const user = await this.prismaService.user.findFirst({
      where: { id: userPayload.sub },
    });

    if (!user) throw new NotFoundException('user not found');
    return (await this.prismaService.user.delete({
      where: { id: userPayload.sub },
    }))
      ? true
      : false;
  }
}
