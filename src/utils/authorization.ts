import { ForbiddenException } from '@nestjs/common';
import { JwtPayloadType } from './types';
import { USER_ROLES } from 'src/generated/prisma/enums';

/**
 * Validates that the current user is either an ADMIN or the owner of the resource.
 * @param user The current authenticated user payload.
 * @param ownerId The ID of the user who owns the resource.
 * @param message The custom error message to display if validation fails.
 */
export function verifyOwnershipOrAdmin(
  user: JwtPayloadType,
  ownerId: number,
  message: string = 'You are not authorized to perform this action',
): void {
  if (user.role !== USER_ROLES.ADMIN && user.sub !== ownerId) {
    throw new ForbiddenException(message);
  }
}
