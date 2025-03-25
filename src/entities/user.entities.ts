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
export class User extends BaseEntity {
  sub(id: string, status: string, sub: any) {
      throw new Error('Method not implemented.');
  }
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

  
}

export const UserSchema = SchemaFactory.createForClass(User);

export type UserDocument = User & Document;
