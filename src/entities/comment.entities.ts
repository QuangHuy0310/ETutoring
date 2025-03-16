import { BaseEntity } from '@entities';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
  collectionOptions: {
    changeStreamPreAndPostImages: { enabled: true },
  },
})
export class Comment extends BaseEntity {
  @Prop({
    type: String
  })
  userId: string;

  @Prop({
    type: String,
  })
  blogId: string;

  @Prop({
    type: String,
  })
  comment: string;

  @Prop({
    type: [String],
  })
  path: string[];

}

export const CommentSchema = SchemaFactory.createForClass(Comment);

export type CommentDocument = Comment & Document;
