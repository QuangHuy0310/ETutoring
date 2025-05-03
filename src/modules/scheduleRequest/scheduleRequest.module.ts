import { ScheduleRequest, ScheduleRequestSchema } from '@entities/ScheduleRequest.entities';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleRequestController } from './scheduleRequest.controller';
import { ScheduleRequestService } from '@modules/scheduleRequest/scheduleRequest.service';
import { NotificationModule } from '@modules/notification/notification.module';
import { ScheduleModule } from '@modules/schedule/schedule.module';

@Module({
    imports: [
        forwardRef(() => NotificationModule),
        forwardRef(() => ScheduleModule),
        MongooseModule.forFeature([
            { name: ScheduleRequest.name, schema: ScheduleRequestSchema},
        ])
    ],
    controllers: [ScheduleRequestController],
    providers: [ScheduleRequestService],
    exports: [ScheduleRequestService],})

export class ScheduleRequestModule {}
