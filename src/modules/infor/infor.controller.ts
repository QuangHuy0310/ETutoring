import { InforService } from '@modules/index-service';
import { Body, Controller, Get, Patch, Post, Put, Query, Request, Delete } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { USER_ROLE } from '@utils/data-types/enums';
import { AuthorizationRequest } from '@utils/data-types/types';
import { RequiredByUserRoles } from '@utils/decorator';
import { CreateInforDto, FilterInformationDto, GetInforDto, UpdateDto } from './dto/infor.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

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

    @ApiQuery({ name: 'idUser', type: String, required: false})
    @RequiredByUserRoles()
    @Get('/get-infors')
    async getInfor(
        @Request() { user }: AuthorizationRequest,
        @Query('idUser') idUser: string,
    ) {
        return this.inforService.handleGetInfor(user, idUser);
    }

    @ApiQuery({ name: 'idUser', required: true })
    @RequiredByUserRoles()
    @Post('/Push-Id')
    async pushList(@Request() { user }: AuthorizationRequest, @Query('idUser') idUser: string) {
        return this.inforService.handlePushId(user, idUser);
    }

    //staff
    @RequiredByUserRoles()
    @Get('/get-role')
    async getMoreInformation(@Query() filters: FilterInformationDto) {
        return this.inforService.getMoreInformationForTutors(filters);
    }

    @RequiredByUserRoles()
    @Get('get-room')
    async getRoom(@Request() { user }: AuthorizationRequest) {
        return this.inforService.handleGateRoom(user);
    }

    @ApiQuery({ name: 'userId', required: true })
    @ApiOperation({ summary: 'Soft delete an information record by userId' })
    @RequiredByUserRoles()
    @Delete('/soft-delete-infors')
    async softDeleteInformation(
        @Request() { user }: AuthorizationRequest,
        @Query('userId') userId: string
    ) {
        return this.inforService.softDeleteInformation(userId);
    }

    @ApiQuery({ name: 'userId', required: true })
    @ApiOperation({ summary: 'Edit an information record by userId' })
    @ApiBody({ type: UpdateDto })
    @RequiredByUserRoles()
    @Put('/edit-infor')
    async editInformation(
        @Request() { user }: AuthorizationRequest,
        @Query('userId') userId: string,
        @Body() payload: UpdateDto
    ) {
        return this.inforService.editInformation(userId, payload);
    }
}