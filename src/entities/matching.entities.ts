import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseEntity } from './base.entities';

@Schema({ timestamps: true })
export class Matching extends BaseEntity {
    @Prop({ type: String, required: true })
    studentId: string;

    @Prop({ type: String, required: true })
    tutorId: string;

    @Prop({ type: String, required: true, default: 'on' })
    status: string;
}

export type MatchingDocument = Matching & Document;
export const MatchingSchema = SchemaFactory.createForClass(Matching);
