import { NotificationDocument, Notification } from '@entities/notification.entities';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationDto, NotificationMatchingDto } from './dto/notification.dto';
import { SocketGateway } from '@modules/chat/socket.gateway';

@Injectable()
export class NotificationService {
    constructor(
        @InjectModel(Notification.name)
        private readonly notificationModel: Model<NotificationDocument>,

        @Inject(forwardRef(() => SocketGateway))
        private readonly socketGate: SocketGateway,
    ) { }
    async createCommentNotification(notificationDto: NotificationDto): Promise<NotificationDto> {
        const notification = new this.notificationModel(notificationDto);
        const { notificationTo, title } = notification
        this.socketGate.sendNotificationComment(notificationTo, title)
        return notification.save();
    }

    async createMatchingNotification(from: string, to: string): Promise<NotificationDto> {
        const payload = {
            notificationFrom: from,
            notificationTo: to,
            title: `You are matched: ${from} with ${to}`,
            status: 'unread'
        };
        
        const notification = new this.notificationModel(payload);

        await this.socketGate.matchingNotification(from, to, payload.title)
        return notification.save();
    }
}
