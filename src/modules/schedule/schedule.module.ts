import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { ScheduleSchema } from '@entities/schedule.entities';
import { SlotModule } from '@modules/slot/slot.module';
import { UserModule } from '@modules/user/user.module';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [

        forwardRef(() => UserModule),
        forwardRef(() => SlotModule),

        MongooseModule.forFeature([
            { name: 'Schedule', schema: ScheduleSchema },
        ],)
    ],
    controllers: [
        ScheduleController,],
    providers: [
        ScheduleService,],
})
export class ScheduleModule { }
