import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseEntity } from '@entities';

@Schema()
export class Confirm extends BaseEntity {
  @Prop({ required: true, type: String }) 
  studentId: string;

  @Prop({type: String })
  tutorId: string;

  @Prop({type: Boolean, default: false})
  statusOfStudent: boolean;

  @Prop({type: Boolean, default: false})
  statusOfTutor: boolean;

}

export const ConfirmSchema = SchemaFactory.createForClass(Confirm);
