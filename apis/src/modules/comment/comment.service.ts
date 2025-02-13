import { Comment, CommentDocument } from '@entities/comment.entities';
import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCommentDto } from './dto/comment.dto';
import { BlogService } from '@modules/index-service';
import { USER_ERRORS } from '@utils/data-types/constants';

@Injectable()
export class CommentService {
    constructor(
        @InjectModel(Comment.name)
        private readonly commentModel: Model<CommentDocument>,
        @Inject(forwardRef(() => BlogService))
        private readonly blogService: BlogService,
    ) { }

    async validBlog(blogId: string): Promise<void> {
        const blog = await this.blogService.getBlogById(blogId);
        if (!blog) {
            throw new HttpException(USER_ERRORS.INVALID_BLOG, HttpStatus.NOT_FOUND);
        }
    }

    async validComment(comment: string, path: any): Promise<void> {
        if (!comment && !path) {
            throw new HttpException(USER_ERRORS.WRONG_CREATE, HttpStatus.BAD_REQUEST);
        }
    }
    async handleCreateComment(user: any, createCommentDto: CreateCommentDto): Promise<Comment> {
        const { comment, path } = createCommentDto;
        createCommentDto.userId = user.sub;

        Promise.all([
            await this.validBlog(createCommentDto.blogId),
            await this.validComment(comment, path)
        ])

        return this.createComment(createCommentDto)
    }

    async createComment(createCommentDto: CreateCommentDto): Promise<Comment> {
        const newComment = new this.commentModel(createCommentDto);
        return newComment.save();
    }

    async getComments(blogId: string): Promise<Comment[]> {
        await this.validBlog(blogId);
        const getComments = await this.commentModel.find({blogId:blogId})
        return getComments
    }

}
