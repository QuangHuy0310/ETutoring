/* eslint-disable prettier/prettier */
import { BaseEntity } from '@entities';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { USER_ROLE } from '@utils/data-types/enums';

@Schema({
  timestamps: true,
  collectionOptions: {
    changeStreamPreAndPostImages: { enabled: true },
  },
})
export class SpecialUser extends BaseEntity {

  @Prop({
    type: String,
  })
  email: string;

  @Prop({
    type: String,
    enum: USER_ROLE,
  })
  role: USER_ROLE;

}

export const SpecialUserSchema = SchemaFactory.createForClass(SpecialUser);

export type SpecialUserDocument = SpecialUser & Document;
