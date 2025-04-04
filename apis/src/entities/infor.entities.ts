import { BaseEntity } from '@entities';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { USER_ROLE } from '@utils/data-types/enums';

@Schema({
    timestamps: true,
    collectionOptions: {
        changeStreamPreAndPostImages: { enabled: true },
    },
})
export class MoreInformation extends BaseEntity {
    @Prop({
        type: String,
    })
    userId: string;

    @Prop({
        type: String,
    })
    name: string;

    @Prop({
        type: String,
    })
    path: string;

    @Prop({
        type: String,
    })
    phone: string;

    @Prop({
        type: String,
    })
    email: string;

    @Prop({
        type: String,
    })
    address: string;

    @Prop({
        type: String,
    })
    country: string;

    @Prop({
        type: String,
    })
    major: string;

    @Prop({ type: [String], ref: "room" })
    roomId: string[];
}

export const MoreInformationSchema = SchemaFactory.createForClass(MoreInformation);

export type MoreInformationDocument = MoreInformation & Document;
