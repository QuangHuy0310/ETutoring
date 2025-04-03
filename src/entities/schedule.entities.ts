import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseEntity } from '@entities';

@Schema({
    timestamps: true,
    collectionOptions: {
        changeStreamPreAndPostImages: { enabled: true },
    },
})
export class Schedule extends BaseEntity {
    @Prop({ required: true, type: String })
    userId: string;

    @Prop({ required: true, type: Number })
    days: number;

    @Prop({ required: true, type: String, ref: 'Slot' })
    slotId: string;

    @Prop({ required: true, type: String })
    majorId: string;

    @Prop({ required: true, type: String })
    partnerId: string;
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);
export type ScheduleDocument = Schedule & Document;

