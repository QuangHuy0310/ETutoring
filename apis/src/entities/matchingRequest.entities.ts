import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseEntity } from './base.entities';

@Schema({ timestamps: true })
export class MatchingRequest extends BaseEntity {
    @Prop({ type: String, required: true })
    studentId: string;

    @Prop({ type: String, required: true })
    tutorId: string;

    @Prop({ type: String, required: true, default: 'pending' })
    status: string; 

    @Prop({ type: String })
    staffId?: string;
}

export type MatchingRequestDocument = MatchingRequest & Document;
export const MatchingRequestSchema = SchemaFactory.createForClass(MatchingRequest);