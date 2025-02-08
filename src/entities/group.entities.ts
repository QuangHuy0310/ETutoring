import { BaseEntity } from '@entities';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { USER_ROLE } from '@utils/data-types/enums';

@Schema({
    timestamps: true,
    collectionOptions: {
        changeStreamPreAndPostImages: { enabled: true },
    },
})
export class Group extends BaseEntity {
    @Prop({
        type: String,
    })
    name: string;

    @Prop({
        type: String,
    })
    TutorId: string;

    @Prop({ type: [String], ref: 'User' })
    membersId: string[];
}

export const GroupSchema = SchemaFactory.createForClass(Group);

export type GroupDocument = Group & Document;
