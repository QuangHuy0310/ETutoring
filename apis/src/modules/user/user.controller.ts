import { Controller, Get, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthorizationRequest } from '@utils/data-types/types';
import { RequiredByUserRoles } from '@utils/decorator';

import { UserService } from './user.service';

@ApiTags('USER')
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @RequiredByUserRoles()
  @Get()
  async getInfor(@Request() { user }: AuthorizationRequest) {
    return this.userService.findByEmail(user.email);
  }
}
