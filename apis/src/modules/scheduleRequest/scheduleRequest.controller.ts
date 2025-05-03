import { ScheduleRequestService } from '@modules/scheduleRequest/scheduleRequest.service';
import { Controller, Get, Post, Put, Query, Request } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthorizationRequest } from '@utils/data-types/types';
import { RequiredByUserRoles } from '@utils/decorator';
import { ScheduleRequestDto, ScheduleRequestUpdateDto } from './dto/scheduleRequest.dto';

ApiTags('ScheduleRequest')
@Controller()
export class ScheduleRequestController {
    constructor(
        private readonly scheduleRequestService: ScheduleRequestService,
    ) { }

    @RequiredByUserRoles()
    @ApiQuery({ name: 'reciverId', type: String, required: true })
    @ApiQuery({ name: 'days', type: String, required: true })
    @ApiQuery({ name: 'slotId', type: String, required: true })
    @Post('schedule-request')
    async createScheduleRequest(
        @Request() { user }: AuthorizationRequest,
        @Query() dto: ScheduleRequestDto) {
        return await this.scheduleRequestService.handleScheduleRequest(user, dto);
    }

    @RequiredByUserRoles()
    @ApiQuery({ name: 'id', type: String, required: true })
    @ApiQuery({ name: 'status', enum: ['accepted', 'rejected'], type: String, required: true })
    @Put('update-schedule-request')
    async updateScheduleRequest(@Query() dto: ScheduleRequestUpdateDto) {
        return await this.scheduleRequestService.updateScheduleRequest(dto);
    }

    @RequiredByUserRoles()
    @ApiQuery({ name: 'reciverId', type: String, required: true })
    @ApiQuery({ name: 'senderId', type: String, required: true })
    @Get('tutor-schedule-request')
    async getScheduleRequestForReciver(@Query('reciverId') reciver: string, @Query('senderId') sender: string){
        return await this.scheduleRequestService.getScheduleRequestForReciver(reciver, sender);
    }

    @RequiredByUserRoles()
    @ApiQuery({ name: 'senderId', type: String, required: true })
    @ApiQuery({ name: 'reciverId', type: String, required: true })
    @Get('student-schedule-request')
    async getScheduleRequestForSender(@Query('senderId') sender: string, @Query('reciverId') reciver: string){
        return await this.scheduleRequestService.getScheduleRequestForSender(sender, reciver);
    }





}
