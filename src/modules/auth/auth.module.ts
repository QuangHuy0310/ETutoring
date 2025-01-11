import { UserModule } from '@modules';
import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.SECRET_JWT,
    }),
    forwardRef(() => UserModule),
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
