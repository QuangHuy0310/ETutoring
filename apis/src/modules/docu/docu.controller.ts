import { DocuService } from '@modules/docu/docu.service';
import { Body, Controller, Get, Post, Put, Query, Request } from '@nestjs/common';
import { AuthorizationRequest } from '@utils/data-types/types';
import { RequiredByUserRoles } from '@utils/decorator';
import { DocumentDto, FilterGetDocumentDto, InputCreateDto, UpdateCommentDto } from './dto/docu.dto';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
@ApiTags('Document')
@Controller()
export class DocuController {
    constructor(private readonly docuService: DocuService) { }

    @ApiQuery({ name: 'roomId', required: true })
    @ApiQuery({ name: 'name', required: true })
    @ApiQuery({ name: 'title', required: true })
    @ApiQuery({ name: 'path', required: true })
    @RequiredByUserRoles()
    @Post('/new-document')
    async createDocument(@Request() { user }: AuthorizationRequest, @Query() dto: InputCreateDto) {
        return this.docuService.handleCreateDoc(user, dto);
    }

    @ApiQuery({ name: 'roomId', required: true })
    @ApiQuery({ name: 'userId', required: false })
    @ApiQuery({ name: 'createdAt', required: false })
    @ApiQuery({ name: 'name', required: false })
    @RequiredByUserRoles()
    @Get('/get-document')
    async getDocument(@Query() dto: FilterGetDocumentDto) {
        return this.docuService.getDocu(dto);
    }

    @ApiQuery({ name: 'id', required: false })
    @ApiQuery({ name: 'comment', required: false })
    @RequiredByUserRoles()
    @Put('/new-comment-document')
    async newComment(@Request() { user }: AuthorizationRequest,@Query() dto: UpdateCommentDto) {
        return this.docuService.handleUpdateComment(user,dto);
    }
}
