import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { SpecialUserService } from './specialUser.service';
import { SpecialUserDto } from '@dtos/specialUser.dto';

@Controller('api/v1/admin/special')
export class SpecialUserController {
  constructor(private readonly specialUserService: SpecialUserService) {}

  @Post('add')
  async createSpecialUser(@Body() createSpecialUserDto: SpecialUserDto) {
    try {
      const { email, role } = createSpecialUserDto;
      const existingUser = await this.specialUserService.findByEmailAndRole(email, role);
      if (existingUser) {
        throw new BadRequestException('SpecialUser already exists');
      }
      return this.specialUserService.saveSpecialUser(email, role);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}