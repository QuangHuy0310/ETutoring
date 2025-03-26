import { User, UserSchema } from '@entities/user.entities';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MailModule } from '@modules/mail/mail.module';
import { SpecialUserModule } from '@modules/specialUser/specialUser.module'; // Thêm import

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    MailModule,
    SpecialUserModule, 
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}