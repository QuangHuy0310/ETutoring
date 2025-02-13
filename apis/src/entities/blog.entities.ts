import { BaseEntity } from '@entities';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
  collectionOptions: {
    changeStreamPreAndPostImages: { enabled: true },
  },
})
export class Blog extends BaseEntity {
  @Prop({
    type: String,
  })
  userId: string;

  @Prop({
    type: String,
  })
  caption: string;

  @Prop({
    type: [String],
  })
  path: string[];

  @Prop({ type: [String] })
  tags: string[];

}

export const BlogSchema = SchemaFactory.createForClass(Blog);

export type BlogDocument = Blog & Document;
