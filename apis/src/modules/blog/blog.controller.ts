import { BlogService } from '@modules/index-service';
import { Body, Controller, Get, Post, Query, Request } from '@nestjs/common';
import { CreateBlogDTO, GetBlogDto } from './dto/blog.dto';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RequiredByUserRoles } from '@utils/decorator';
import { USER_ROLE } from '@utils/data-types/enums';
import { AuthorizationRequest } from '@utils/data-types/types';
@ApiTags('Blog')
@Controller()
export class BlogController {
    constructor(private readonly blogService: BlogService) { }

    @RequiredByUserRoles(USER_ROLE.USER)
    @Post('/new-blog')
    async createBlog(
        @Request() { user }: AuthorizationRequest,
        @Body() createBlogDto: CreateBlogDTO
    ) {
        return await this.blogService.handleCreateBlog(user, createBlogDto);
    }

    @RequiredByUserRoles(USER_ROLE.USER)
    @Get('/blogs')
    @ApiOperation({ summary: 'Get blog with tag, caption' })
    @ApiQuery({ name: 'page', type: Number, required: false, example: 1 })
    @ApiQuery({ name: 'limit', type: Number, required: false, example: 10 })
    @ApiQuery({ name: 'tags', type: [String], required: false, example: ['nestjs', 'mongodb'] })
    @ApiQuery({ name: 'caption', type: String, required: false, example: 'nestjs' })
    async getBlogs(@Query() getBlogDto: GetBlogDto) {
        return this.blogService.getBlogs(getBlogDto);
    }
}
