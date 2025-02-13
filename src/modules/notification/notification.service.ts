import { NotificationDocument, Notification } from '@entities/notification.entities';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationDto } from './dto/notification.dto';
import { SocketGateway } from '@modules/chat/socket.gateway';

@Injectable()
export class NotificationService {
    constructor(
        @InjectModel(Notification.name) 
        private readonly notificationModel: Model<NotificationDocument>,

        @Inject(forwardRef(() => SocketGateway))
                private readonly socketGate: SocketGateway,
    ) {}
    async createNotification(notificationDto: NotificationDto): Promise<NotificationDto> {
        const notification = new this.notificationModel(notificationDto);
        const {notificationTo, blogId} = notification
        this.socketGate.sendNotification(notificationTo,blogId)
        return notification.save();
    }
 }
