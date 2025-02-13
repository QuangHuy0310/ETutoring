import { MongooseModule } from '@nestjs/mongoose';
import { NotificationService } from './notification.service';
import { forwardRef, Module } from '@nestjs/common';
import { NotificationSchema, Notification } from '@entities/notification.entities';
import { ChatModule } from '@modules/chat/chat.module';

@Module({
    imports: [
        forwardRef(() => ChatModule),
        MongooseModule.forFeature([
            {
                name: Notification.name,
                schema: NotificationSchema,
            },
        ]),
    ],
    controllers: [],
    providers: [
        NotificationService,],
    exports: [NotificationService]
})
export class NotificationModule { }
