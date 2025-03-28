import { InforService } from '@modules/index-service';
import { Body, Controller, Get, Patch, Post, Put, Query, Request, Delete } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { USER_ROLE } from '@utils/data-types/enums';
import { AuthorizationRequest } from '@utils/data-types/types';
import { RequiredByUserRoles } from '@utils/decorator';
import { CreateInforDto, FilterInformationDto, GetInforDto, UpdateDto } from './dto/infor.dto';

@ApiTags('Information')
@Controller()
export class InforController {
    constructor(private readonly inforService: InforService) { }

    @RequiredByUserRoles()
    @Post('/new-Information')
    async createBlog(
        @Request() { user }: AuthorizationRequest,
        @Body() createInforDto: CreateInforDto
    ) {
        return await this.inforService.handleCreateInfor(user, createInforDto);
    }

    @RequiredByUserRoles()
    @Get('/get-infors')
    async getInfor(@Request() { user }: AuthorizationRequest) {
        return this.inforService.handleGetInfor(user);
    }

    @ApiQuery({ name: 'idUser', required: true })
    @RequiredByUserRoles()
    @Post('/Push-Id')
    async pushList(@Request() { user }: AuthorizationRequest, @Query('idUser') idUser: string) {
        return this.inforService.handlePushId(user, idUser);
    }

    @RequiredByUserRoles()
    @Get('/get-tutors')
    async getMoreInformation(@Query() filters: FilterInformationDto) {
        return this.inforService.getMoreInformationForTutors(filters);
    }

    @RequiredByUserRoles()
    @Put()
    async updateInformation(@Request() { user }: AuthorizationRequest, idUser: string, payload: UpdateDto) {
        // Not implemented yet
    }

    // API: Update information
    @ApiQuery({ name: 'id', required: true })
    @ApiOperation({ summary: 'Update information by ID' })
    @RequiredByUserRoles()
    @Put('/edit-infors')
    async editInfor(
        @Query('id') id: string,
        @Body() updateDto: UpdateDto,
    ) {
        return this.inforService.updateInfor(id, updateDto);
    }

    // API: Soft delete information
    @ApiQuery({ name: 'id', required: true })
    @ApiOperation({ summary: 'Soft delete information by ID' })
    @RequiredByUserRoles()
    @Delete('/soft-delete-infors')
    async softDeleteInfor(@Query('id') id: string) {
        await this.inforService.softDeleteInfor(id);
        return { message: 'Information soft-deleted successfully' };
    }
}