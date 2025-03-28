import { InforController } from './infor.controller';
import { InforService } from './infor.service';
import { MoreInformation, MoreInformationSchema } from '@entities/infor.entities';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomModule } from '@modules/room/room.module';

@Module({
    imports: [
        forwardRef(() => RoomModule),
        MongooseModule.forFeature([
            { name: MoreInformation.name, schema: MoreInformationSchema },
        ]
        )],
    controllers: [
        InforController, ],
    providers: [
        InforService,],
})
export class InforModule { }
