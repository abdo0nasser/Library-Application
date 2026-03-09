import { USER_ROLES } from 'generated/prisma/enums';

export type PayloadType = { sub: number; email: string; role: USER_ROLES };
