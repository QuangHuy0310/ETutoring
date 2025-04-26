import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Matching, MatchingSchema } from '@entities/matching.entities';
import { MatchingService } from './matching.service';
import { MatchingController } from './matching.controller';
import { UserModule } from '@modules/user/user.module';
import { MailModule } from '@modules/mail/mail.module';
import { RoomModule } from '@modules/room/room.module';
import { NotificationModule } from '@modules/notification/notification.module';
import { InforModule } from '@modules/infor/infor.module'; 

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Matching.name, schema: MatchingSchema },
        ]),
        UserModule,
        MailModule,
        RoomModule,
        NotificationModule,
        InforModule,
    ],
    controllers: [MatchingController],
    providers: [MatchingService],
    exports: [MatchingService],
})
export class MatchingModule {}