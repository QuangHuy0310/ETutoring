import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { USER_TYPE_KEY } from '@utils/data-types/constants';
import { USER_ROLE } from '@utils/data-types/enums';

@Injectable()
export class UserTypeGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride<USER_ROLE[]>(
      USER_TYPE_KEY,
      [context.getHandler(), context.getClass()],
    );
    const request = context.switchToHttp().getRequest();

    if (!requiredRoles) {
      return true;
    }

    const { user } = request;

    if (requiredRoles.length == 0) return true;
    else return requiredRoles.some((role) => user.role == role);
  }
}
