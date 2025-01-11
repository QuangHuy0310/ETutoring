import { LoginDto, RegisterDto } from '@dtos/auth.dto';
import { AuthService } from '@modules/index-service';
import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '@utils/decorator';

@ApiTags('AUTHENTICATION')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/register')
  async register(@Body() payload: RegisterDto) {
    return this.authService.register(payload);
  }

  @Public()
  @Post('/login')
  async login(@Body() payload: LoginDto) {
    return this.authService.login(payload);
  }

  @Post('refresh-token')
  async refreshAccessToken(@Body('refreshToken') refreshToken: string) {
    if (!refreshToken) {
      throw new HttpException('Refresh Token is required', HttpStatus.BAD_REQUEST);
    }

    return await this.authService.refreshAccessToken(refreshToken);
  }

  @Post('logout')
  async logout(@Body('refreshToken') refreshToken: string) {
    if (!refreshToken) {
      throw new HttpException('Refresh Token is required', HttpStatus.BAD_REQUEST);
    }

    return await this.authService.logout(refreshToken);
  }
}
