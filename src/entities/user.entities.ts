import { BaseEntity } from '@entities';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { USER_ROLE } from '@utils/data-types/enums';

@Schema({
  timestamps: true,
  collectionOptions: {
    changeStreamPreAndPostImages: { enabled: true },
  },
})
export class User extends BaseEntity {
  @Prop({
    type: String,
  })
  email: string;

  @Prop({
    type: String,
  })
  hash: string;

  @Prop({
    type: String,
    enum: USER_ROLE,
  })
  role: USER_ROLE;

  @Prop({
    type: String,
  })
  tutorId: string;

  @Prop({ type: [String]})
    membersId: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);

export type UserDocument = User & Document;
