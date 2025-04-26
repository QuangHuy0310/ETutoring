import { MatchingRequestService } from './matchingRequest.service';
import { Controller, Post, Body, Request, Get, Patch, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { RequiredByUserRoles } from '@utils/decorator';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateMatchingRequestDto, UpdateMatchingRequestStatusDto, MatchingRequestResponseDto } from './dto/matchingRequest.dto';
import { USER_ROLE } from '@utils/data-types/enums';
import { AuthorizationRequest } from '@utils/data-types/types';

@ApiTags('Matching Requests')
@Controller('matching-request')
export class MatchingRequestController {
    constructor(
        private readonly matchingRequestService: MatchingRequestService
    ) {}

    // API for student to send a matching request 
    @ApiOperation({ summary: 'Send a matching request to staff' })
    @RequiredByUserRoles(USER_ROLE.USER)
    @ApiBody({ type: CreateMatchingRequestDto })
    @ApiResponse({ status: 201, description: 'Matching request sent successfully' })
    @Post('send-request')
    async sendRequest(
        @Body() requestDto: CreateMatchingRequestDto,
        @Request() { user }: AuthorizationRequest
    ) {
        // Ensure the studentId in the request matches the authenticated user
        return await this.matchingRequestService.sendMatchingRequest(requestDto);
    }

    // API to get list of matching requests
    @ApiOperation({ summary: 'Get list of matching requests (staff: all, student: their own)' })
    @RequiredByUserRoles(USER_ROLE.USER, USER_ROLE.STAFF)
    @ApiQuery({ name: 'status', required: false, enum: ['pending', 'accepted', 'rejected'] })
    @ApiResponse({ status: 200, type: [MatchingRequestResponseDto], description: 'List of matching requests' })
    @Get('list')
    async getMatchingRequests(
        @Request() { user }: AuthorizationRequest,
        @Query('status') status?: string
    ) {
        return await this.matchingRequestService.getMatchingRequests(user, status);
    }

    // API for staff to update status of a matching request
    @ApiOperation({ summary: 'Update status of a matching request (staff only)' })
    @RequiredByUserRoles(USER_ROLE.STAFF)
    @ApiBody({ type: UpdateMatchingRequestStatusDto })
    @ApiResponse({ status: 200, type: MatchingRequestResponseDto, description: 'Matching request updated' })
    @Patch(':id/update-status')
    async updateMatchingRequestStatus(
        @Param('id') requestId: string,
        @Body() statusDto: UpdateMatchingRequestStatusDto,
        @Request() { user }: AuthorizationRequest
    ) {
        return await this.matchingRequestService.updateMatchingRequestStatus(requestId, statusDto, user._id);
    }
}