import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseEntity } from './base.entities';

@Schema({ timestamps: true })
export class Notification extends BaseEntity {
    @Prop({ type: String, required: true })
    notificationFrom: string;

    @Prop({ type: String, required: true })
    notificationTo: string;

    @Prop({ type: String, required: true })
    blogId: string;

    @Prop({ type: String, default: 'unread' })
    status: string;
}

export type NotificationDocument = Notification & Document;
export const NotificationSchema = SchemaFactory.createForClass(Notification);
