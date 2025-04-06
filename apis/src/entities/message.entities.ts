import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseEntity } from '@entities';

@Schema()
export class Message extends BaseEntity {
  @Prop({type: String})
  roomId : string;
  
  @Prop({ required: true, type: String }) 
  senderId: string;

  @Prop({type: String })
  message: string;

  @Prop ({type: String})
  path: string

  @Prop({
    type: Date,
    default: () => Date.now(),
  })
  createdAt: Date;

  @Prop({})
  deletedAt: Date

}

export type MessageDocument = Message & Document;
export const MessageSchema = SchemaFactory.createForClass(Message);