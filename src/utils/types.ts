import { USER_ROLES } from 'generated/prisma/enums';

export type JwtPayloadType = {
  sub: number;
  email: string;
  role: USER_ROLES;
  isVerified: boolean;
};
