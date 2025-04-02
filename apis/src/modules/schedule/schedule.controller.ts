import { Controller, Get, Post, Query, Request } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { RequiredByUserRoles } from '@utils/decorator';
import { AuthorizationRequest } from '@utils/data-types/types';
import { InputScheduleDto, QueryScheduleDto } from './dto/schedule.dto';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Schedule')
@Controller()
export class ScheduleController {
    constructor(private readonly scheduleService: ScheduleService) { }

    @ApiQuery({ name: 'userId', type: String, required: true,})
    @ApiQuery({ name: 'days', type: String, required: true,})
    @ApiQuery({ name: 'slotId', type: String, required: true,  })
    @ApiQuery({ name: 'matchingWith', type: String, required: true,  })
    @RequiredByUserRoles()
    @Post('/new-schedule')
    async createSchedule(
        @Query() inputScheduleDto: InputScheduleDto
    ) {
        return await this.scheduleService.handleCreateSchedule(inputScheduleDto);
    }

    @RequiredByUserRoles()
    @Get('get-schedule')
    @ApiQuery({ name: 'userId', type: String, required: true,  })
    @ApiQuery({ name: 'week', type: Number, required: false,  })
    @ApiQuery({ name: 'month', type: Number, required: false,  })
    @ApiQuery({ name: 'year', type: Number, required: false,  })
    async getSchedule(@Request() { user }: AuthorizationRequest,@Query() getScheduleDto: QueryScheduleDto) {
        return this.scheduleService.getSchedule(getScheduleDto);
    }
}
