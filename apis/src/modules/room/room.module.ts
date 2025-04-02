import { RoomController } from './room.controller';
import { RoomService } from './room.service';

import { Room, RoomSchema } from '@entities/room.entities';
import { InforModule } from '@modules/infor/infor.module';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [
        forwardRef(() => InforModule),

        MongooseModule.forFeature(
            [
                {
                    name: Room.name,
                    schema: RoomSchema,
                },
            ]
        )
    ],
    controllers: [
        RoomController,],
    providers: [
        RoomService,],
    exports: [RoomService]
})
export class RoomModule { }
