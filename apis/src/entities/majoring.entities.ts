import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseEntity } from './base.entities';

@Schema({ timestamps: true })
export class Major extends BaseEntity {
    @Prop({ type: String, required: true })
    name: string;
}

export type MajorDocument = Major & Document;
export const MajorSchema = SchemaFactory.createForClass(Major);
