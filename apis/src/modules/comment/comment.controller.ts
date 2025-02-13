import { CommentService } from '@modules/index-service';
import { Body, Controller, Get, Post, Query, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { USER_ROLE } from '@utils/data-types/enums';
import { AuthorizationRequest } from '@utils/data-types/types';
import { RequiredByUserRoles } from '@utils/decorator';
import { BodyCommentDto, CreateCommentDto } from './dto/comment.dto';
@ApiTags('Comment')
@Controller()
export class CommentController {
    constructor(
        private readonly commentService: CommentService,
    ) { }

    @RequiredByUserRoles(USER_ROLE.USER)
    @Post('/new-comment')
    async createComment(
        @Request() { user }: AuthorizationRequest,
        @Query('id') blogId: string,
        @Body() bodyCommentDto: BodyCommentDto
    ) {
        const payload = {
            blogId,
            ...bodyCommentDto
        }
        return await this.commentService.handleCreateComment(user, payload);
    }

    @RequiredByUserRoles(USER_ROLE.USER)
    @Get('/get-comment')
    async getComments(@Query('blogId') id:string) {
        return await this.commentService.getComments(id);
    }

}
