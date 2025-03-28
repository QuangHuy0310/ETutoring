import { BadRequestException, Body, Controller, Get, Post, Request, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthorizationRequest } from '@utils/data-types/types';
import { RequiredByUserRoles } from '@utils/decorator';

import { UserService } from './user.service';
import { RegisterDto } from '@dtos/auth.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { USER_ROLE } from '@utils/data-types/enums';

@ApiTags('USER')
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @RequiredByUserRoles()
  @Get()
  async getInfor(@Request() { user }: AuthorizationRequest) {
    return user
  }

  @RequiredByUserRoles(USER_ROLE.ADMIN)
  @Get('/mail')
  async sendWelcomemail(@Body() body: { email: string, password: string, userId: string }) {
    return this.userService.sendWelcomeEmail(body.email, body.password, body.userId);
  }

  @RequiredByUserRoles(USER_ROLE.ADMIN)
  @Post('bulk-create-from-file')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './file_uploads', // Folder where files will be stored
      filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Create a unique filename
      },
    }),
  }))
  async bulkCreateUsersFromFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() { user }: AuthorizationRequest
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const createdUsers = await this.userService.bulkCreateUsersFromFile(file);
    return {
      message: 'Created users successfully from file',
      count: createdUsers.length,
      users: createdUsers.map(u => ({ id: u._id, email: u.email, role: u.role })),
    };
  }

}
