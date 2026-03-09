import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { USER_ROLES } from 'generated/prisma/enums';
import { PayloadType } from 'src/utils/types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const roles = this.reflector.getAllAndOverride<USER_ROLES[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles || roles.length == 0) return false;

    const request: Request = context.switchToHttp().getRequest();
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (token && type.toLowerCase() === 'bearer') {
      const payload: PayloadType = await this.jwtService.verifyAsync(token);
      if (!payload) return false;
      if (roles.includes(payload.role)) {
        request['user'] = payload;
        return true;
      }
    }
    return false;
  }
}
