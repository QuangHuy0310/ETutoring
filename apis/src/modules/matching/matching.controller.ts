import { MatchingService } from '@modules/matching/matching.service';
import { Controller, Post, Query, Body, Put } from '@nestjs/common';
import { ApiQuery, ApiOperation, ApiBody } from '@nestjs/swagger';
import { RequiredByUserRoles } from '@utils/decorator';
import { CreateMatchingDto, CreateBulkMatchingDto } from './dto/matching.dto';

@Controller()
export class MatchingController {
    constructor(
        private readonly matchService: MatchingService
    ) {}

    @RequiredByUserRoles()
    @ApiQuery({ name: 'studentId', type: String, required: true })
    @ApiQuery({ name: 'tutorId', type: String, required: true })
    @Post('matching')
    async createMatching(@Query() createMatchingDto: CreateMatchingDto) {
        return await this.matchService.createMatching(createMatchingDto);
    }

    @RequiredByUserRoles()
    @Post('bulk-matching')
    @ApiOperation({ summary: 'Match multiple students with a tutor' })
    @ApiBody({ type: CreateBulkMatchingDto })
    async createBulkMatching(@Body() createBulkMatchingDto: CreateBulkMatchingDto) {
        return await this.matchService.createBulkMatching(createBulkMatchingDto);
    }


    @RequiredByUserRoles()
    @ApiQuery({ name: 'roomId', type: String, required: true })
    @Put('Update-Status-Matching')
    async updateStatusMatching(@Query('roomId') roomId: string) {
        return await this.matchService.getMatchingByRoomId(roomId);
    }
}