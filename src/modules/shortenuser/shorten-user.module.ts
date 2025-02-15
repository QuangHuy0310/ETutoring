import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ShortenUserService } from './shorten-user.service';
import { ShortenUser, ShortenUserSchema } from '@entities/shorten-user.entities';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ShortenUser.name,
        schema: ShortenUserSchema,
      },
    ]),
  ],
  providers: [ShortenUserService],
  exports: [ShortenUserService],
})
export class ShortenUserModule {}
