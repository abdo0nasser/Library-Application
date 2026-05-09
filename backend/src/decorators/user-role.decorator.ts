import { SetMetadata } from '@nestjs/common';
import { USER_ROLES } from 'src/generated/prisma/enums';

export const Roles = (...roles: USER_ROLES[]) => SetMetadata('roles', roles);
