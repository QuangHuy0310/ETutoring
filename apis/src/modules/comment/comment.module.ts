import { Comment, CommentSchema } from '@entities/comment.entities';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogModule } from '@modules/blog/blog.module';
import { NotificationModule } from '@modules/notification/notification.module';

@Module({
    imports: [
        forwardRef(() => BlogModule),
        forwardRef(() => NotificationModule),
        MongooseModule.forFeature(
            [
                {
                    name: Comment.name,
                    schema: CommentSchema,
                },
            ]
        )
    ],
    controllers: [
        CommentController,],
    providers: [
        CommentService,],
})
export class CommentModule { }
