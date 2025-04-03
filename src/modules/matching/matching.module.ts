import { MongooseModule } from '@nestjs/mongoose';
import { MatchingController } from './matching.controller';
import { MatchingService } from './matching.service';
/*
https://docs.nestjs.com/modules
*/

import { forwardRef, Module } from '@nestjs/common';
import { MatchingSchema } from '@entities/matching.entities';
import { NotificationModule } from '@modules/notification/notification.module';
import { RoomModule } from '@modules/room/room.module';

@Module({
    imports: [
        forwardRef(() => NotificationModule),
        forwardRef(() => RoomModule),
        MongooseModule.forFeature([
            { name: 'Matching', schema: MatchingSchema },
        ]),
    ],
    controllers: [
        MatchingController,],
    providers: [
        MatchingService,],
})
export class MatchingModule { }
