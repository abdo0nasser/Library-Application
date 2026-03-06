import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { hash } from 'src/utils/argon';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}
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
    user.age = updateUserDto.age;
    user.description = updateUserDto.description;
    user.name = updateUserDto.name;
    user.password = await hash(user.password);
    return await this.prismaService.user.update({
      where: { id },
      data: user,
    });
  }

  async deleteUser(id: number) {
    const user = await this.prismaService.user.findFirst({ where: { id } });
    if (!user) throw new NotFoundException('no user with this Id');
    return (await this.prismaService.user.delete({ where: { id } })) ?? false;
  }
}
