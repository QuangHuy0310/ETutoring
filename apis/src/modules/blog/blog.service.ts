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

    async validBlogId(blogId: string): Promise<any> {
        const blog = await this.blogModel.findById(blogId);

        if (!blog) {
            throw new HttpException(USER_ERRORS.INVALID_BLOG, HttpStatus.NOT_FOUND);
        }

        return blog;
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

    async getBlogs(user: any, getBlogDto: GetBlogDto): Promise<{ item: any[], total: number }> {
        const { page, limit, tags, caption } = getBlogDto;

        await this.validPageBlog(page, limit);

        const skip = (page - 1) * limit;

        const { sub, role } = user;

        const query: any = {
            status: 'approve',
            deleteAt: null
        };

        if (role === 'staff' || role === 'admin') {
            query.status = getBlogDto.status;
        }

        if (tags && tags.length > 0) {
            query.$or = tags.map(tag => ({ tags: { $regex: tag, $options: 'i' } }));
        }

        if (caption) {
            query.caption = { $regex: caption, $options: 'i' };
        }

        const blogs = await this.blogModel.aggregate([
            { $match: query },

            {
                $lookup: {
                    from: 'moreinformations',
                    localField: 'userId',
                    foreignField: 'userId',
                    as: 'userInfo'
                }
            },

            { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },

            {
                $project: {
                    'userId': 1,
                    'userInfo.name': 1,
                    'userInfo.path': 1,
                    _id: 1,
                    caption: 1,
                    tags: 1,
                    status: 1,
                    path:1
                }
            }
        ])
            .skip(skip)
            .limit(limit);

        const total = await this.blogModel.countDocuments(query);

        return { item: blogs, total };
    }


    async getBlogById(id: string): Promise<Blog> {
        const blog = await this.blogModel.findById(id)
        return blog;
    }

    async updateStatusBlog(id: string, status: string): Promise<Blog> {

        const blog = await this.validBlogId(id)

        blog.status = status
        blog.save()

        return blog
    }

    // Get timeline of a blog (creation and status updates)
    async getBlogTimeline(blogId: string, user: any): Promise<any[]> {
        const blog = await this.validBlogId(blogId);

    // Check permission: Only admin, staff, or blog owner can view timeline
    if (user.role !== 'admin' && user.role !== 'staff' && user.sub !== blog.userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const timeline: any[] = [];

    // Event: Blog creation
    timeline.push({
      timestamp: blog.createdAt,
      eventType: 'created',
      details: {
        userId: blog.userId,
        caption: blog.caption,
      },
    });

    // Event: Status update (using updatedAt as the timestamp)
    if (blog.updatedAt && blog.createdAt.getTime() !== blog.updatedAt.getTime()) {
      timeline.push({
        timestamp: blog.updatedAt,
        eventType: 'status_updated',
        details: {
          status: blog.status,
        },
      });
    }

    // Sort timeline by timestamp
    timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return timeline;
  }

}
