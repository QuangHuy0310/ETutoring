import { MatchingRequestService } from './matchingRequest.service';
import { Controller, Post, Body, Request } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger'; // Add ApiResponse and ApiTags
import { RequiredByUserRoles } from '@utils/decorator';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateMatchingRequestDto } from './dto/matchingRequest.dto';
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
    @Post('send-request')
    async sendRequest(
        @Body() requestDto: CreateMatchingRequestDto,
        @Request() { user }: AuthorizationRequest
    ) {
        // Ensure the studentId in the request matches the authenticated user
        return await this.matchingRequestService.sendMatchingRequest(requestDto);
    }
}