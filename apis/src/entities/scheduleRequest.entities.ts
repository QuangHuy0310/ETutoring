import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseEntity } from '@entities';

@Schema({
    timestamps: true,
    collectionOptions: {
        changeStreamPreAndPostImages: { enabled: true },
    },
})
export class ScheduleRequest extends BaseEntity {
    @Prop({ required: true, type: String })
    senderId: string;

    @Prop({ required: true, type: String })
    reciverId: string;

    @Prop({ required: true, type: String })
    status: string;

    @Prop({ required: true, type: String })
    days: string;

    @Prop({ required: true, type: String })
    slotId: string;

}

export const ScheduleRequestSchema = SchemaFactory.createForClass(ScheduleRequest);
export type ScheduleRequestDocument = ScheduleRequest & Document;

