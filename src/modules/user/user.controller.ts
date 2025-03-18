import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthorizationRequest } from '@utils/data-types/types';
import { RequiredByUserRoles } from '@utils/decorator';

import { UserService } from './user.service';
import { RegisterDto } from '@dtos/auth.dto';

@ApiTags('USER')
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  //@RequiredByUserRoles()
  @Get()
  async getInfor(@Request() { user }: AuthorizationRequest) {
    return user
  }

  //@RequiredByUserRoles(USER_ROLE.ADMIN)
  @Get('/mail')
  async sendWelcomemail(@Body() body: { email: string, password: string, userId: string }) {
    return this.userService.sendWelcomeEmail(body.email, body.password, body.userId);
  }

  //@RequiredByUserRoles(USER_ROLE.ADMIN)
  @Post('bulk-create')
  async bulkCreateUsers(
    @Body() users: RegisterDto[],
    @Request() { user }: AuthorizationRequest
  ) {
    const createdUsers = await this.userService.bulkCreateUsers(users);
    return {
      message: 'Created users successfully',
      count: createdUsers.length,
      users: createdUsers.map(u => ({ id: u._id, email: u.email, role: u.role })),
    };
  }
}
