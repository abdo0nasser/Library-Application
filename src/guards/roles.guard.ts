import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { USER_ROLES } from 'src/generated/prisma/enums';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<USER_ROLES[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required for this route, allow access
    if (!roles || roles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Populated by AuthGuard

    // If there is no user attached to the request, deny access
    if (!user) return false;

    // Check if the user's role is in the list of allowed roles
    return roles.includes(user.role);
  }
}
