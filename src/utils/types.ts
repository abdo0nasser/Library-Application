import { USER_ROLES } from 'generated/prisma/enums';

export type JwtPayloadType = {
  sub: number;
  email: string;
  role: USER_ROLES;
  isVerified: boolean;
};

export interface FacebookUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface PaginatedResult<T> {
  data: T[];
  metadata: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    [key: string]: any;
  };
}
