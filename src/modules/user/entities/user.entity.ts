import { ApiProperty } from '@nestjs/swagger';
import { user } from 'src/generated/prisma/client';
import { USER_ROLES } from 'src/generated/prisma/enums';

export class UserEntity implements Omit<user, 'password'> {
  @ApiProperty()
  id: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  email: string;
  @ApiProperty({ required: false, nullable: true })
  age: number | null;
  @ApiProperty({ required: false, nullable: true })
  description: string | null;
  @ApiProperty({ required: false, nullable: true })
  user_profile: string | null;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty({ enum: USER_ROLES })
  user_role: USER_ROLES;
  @ApiProperty({ required: false, nullable: true })
  email_verified_at: Date | null;
  @ApiProperty({ required: false, nullable: true })
  facebook_id: string | null;
}
