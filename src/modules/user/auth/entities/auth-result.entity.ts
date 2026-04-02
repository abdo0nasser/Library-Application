import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../../entities/user.entity';

export class AuthResultEntity {
  @ApiProperty({ required: false, type: UserEntity })
  user?: UserEntity;
}
