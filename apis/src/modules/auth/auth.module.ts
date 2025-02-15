import { UserModule } from '@modules';
import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ShortenUserModule } from '@modules/shortenuser/shorten-user.module';


@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.SECRET_JWT,
    }),
    forwardRef(() => UserModule),
    ShortenUserModule,
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
