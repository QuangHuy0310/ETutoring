import { UserTypeGuard } from '@guards';
import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AUTH_ERRORS, USER_TYPE_KEY } from '@utils/data-types/constants';

export const RequiredByUserRoles = (...userTypes: string[]) =>
  applyDecorators(
    ApiBearerAuth(),
    SetMetadata(USER_TYPE_KEY, userTypes),
    UseGuards(UserTypeGuard),
    ApiUnauthorizedResponse({ description: AUTH_ERRORS.UNAUTHORIZED }),
  );
