import { Blog, BlogDocument } from '@entities/blog.entities';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateBlogDTO, GetBlogDto } from './dto/blog.dto';
import { USER_ERRORS } from '@utils/data-types/constants';

@Injectable()
export class BlogService {
    @InjectModel(Blog.name) private readonly blogModel: Model<BlogDocument>;

    async validBlog(caption, path): Promise<void> {
        if (!caption || !path) {
            throw new HttpException(USER_ERRORS.WRONG_CREATE, HttpStatus.BAD_REQUEST);
        }
    }

    async handleCreateBlog(user: any, createBlog: CreateBlogDTO): Promise<Blog> {
        const { caption, path } = createBlog;
        createBlog.userId = user.sub;
        await this.validBlog(caption, path);
        return await this.createBlog(createBlog)
    }
    async createBlog(createBlog: CreateBlogDTO): Promise<Blog> {
        const newBlog = new this.blogModel(createBlog);
        return newBlog.save();
    }

    async validPageBlog(page: number, limit: number): Promise<void> {
        if (page <= 0 && limit <= 0) {
            throw new HttpException(USER_ERRORS.WRONG_PAGE, HttpStatus.BAD_REQUEST);
        }
    }

    async getBlogs(getBlogDto: GetBlogDto): Promise<{ item: Blog[], total: number }> {
        const { page, limit, tags, caption } = getBlogDto

        await this.validPageBlog(page, limit);

        const skip = (page - 1) * limit;

        const query: any = {}

        if (tags && tags.length > 0) {
            query.$or = tags.map(tag => ({ tags: { $regex: tag, $options: 'i' } }))
        }

        if (caption) {
            query.caption = { $regex: caption, $options: 'i' }
        }

        const [blogs, total] = await Promise.all([
            this.blogModel.find(query).skip(skip).limit(limit).exec(),
            this.blogModel.countDocuments(query)
        ])



        return { item: blogs, total };
    }

    async getBlogById(id: string): Promise<Blog> {
        const blog = await this.blogModel.findById(id)
        return blog;
    }

}
