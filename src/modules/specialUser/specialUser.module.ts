import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SpecialUserService } from './specialUser.service';
import { SpecialUser, SpecialUserSchema } from '@entities/special-role-user.entities';
import { SpecialUserController } from './specialUser.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SpecialUser.name,
        schema: SpecialUserSchema,
      },
    ]),
  ],
  providers: [SpecialUserService],
  controllers: [SpecialUserController],
  exports: [SpecialUserService],
})
export class SpecialUserModule {}
