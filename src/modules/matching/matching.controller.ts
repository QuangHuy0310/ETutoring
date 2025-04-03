import { MatchingService } from '@modules/matching/matching.service';
import { Controller, Post, Query } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { RequiredByUserRoles } from '@utils/decorator';
import { CreateMatchingDto } from './dto/matching.dto';

@Controller()
export class MatchingController {
    constructor(
        private readonly matchService: MatchingService

    ) { }

    @RequiredByUserRoles()
    @ApiQuery({ name: 'studentId', type: String, required: true, })
    @ApiQuery({ name: 'tutorId', type: String, required: true, })
    @Post('matching')
    async createMatching(@Query() createMatchingDto: CreateMatchingDto) {
        return await this.matchService.createMatching(createMatchingDto)
    }
}
