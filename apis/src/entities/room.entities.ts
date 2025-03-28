import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseEntity } from './base.entities';

@Schema({ timestamps: true })
export class Room extends BaseEntity {
    @Prop({ type: [String], required: true })
    userId: string[];
}

export type RoomDocument = Room & Document;
export const RoomSchema = SchemaFactory.createForClass(Room);
