import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseEntity } from './base.entities';

@Schema({ timestamps: true })
export class Documentation extends BaseEntity {
    @Prop({ type: String, required: true })
    roomId: string;

    @Prop({ type: String, required: true })
    userId: string;

    @Prop({ type: String, required: true })
    name: string;

    @Prop({ type: String, required: true })
    title: string;

    @Prop({ type: String, required: true })
    path: string

    @Prop({ type: String, required: false })
    comment: string
}

export type DocumentationDocument = Documentation & Document;
export const DocumentationSchema = SchemaFactory.createForClass(Documentation);
