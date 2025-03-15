import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseEntity } from '@entities';

@Schema({
    timestamps: true,
    collectionOptions: {
        changeStreamPreAndPostImages: { enabled: true },
    },
})
export class Slot extends BaseEntity {
    @Prop({ required: true, type: String })
    name: string;

    @Prop({ required: true, type: String })
    timeStart: string;

    @Prop({ required: true, type: String })
    timeEnd: string;
}

export const SlotSchema = SchemaFactory.createForClass(Slot);
export type SlotDocument = Slot & Document;

