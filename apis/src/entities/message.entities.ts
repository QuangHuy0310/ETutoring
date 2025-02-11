import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseEntity } from '@entities';

@Schema()
export class Message extends BaseEntity {
  @Prop({ required: true, type: String }) 
  senderId: string;

  @Prop({type: String })
  receiverId: string;

  // @Prop({type: String })
  // groupId: string;

  @Prop({ required: true, type: String})
  message: string;

}

export const MessageSchema = SchemaFactory.createForClass(Message);
