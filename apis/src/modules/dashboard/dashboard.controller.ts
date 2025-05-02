import { DashboardService } from '@modules/dashboard/dashboard.service';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { RequiredByUserRoles } from '@utils/decorator';
import { FilterTimeDto } from './dto/dashboard.dto';

ApiTags('Dashboard')
@Controller()
export class DashboardController {
    constructor(
        private readonly dashboardService: DashboardService,
    ) { }

    @RequiredByUserRoles()
    @ApiQuery({ name: 'idUser', type: String, required: true })
    @ApiQuery({ name: 'month', type: String, required: false })
    @ApiQuery({ name: 'year', type: String, required: false })

    @Get('number-message-in-month')
    async getNumberMessageInMonth(
        @Query('idUser') idUser: string,
        @Query() dto: Omit<FilterTimeDto, 'idUser'>
    ) {
        return await this.dashboardService.getNumberMessageInMonth(idUser, dto);
    }


    @RequiredByUserRoles()
    @ApiQuery({ name: 'idUser', type: String, required: true })
    @ApiQuery({ name: 'month', type: Number, required: false, default: 0 })
    @ApiQuery({ name: 'year', type: Number, required: true })

    @Get('Number-Matching')
    async getNumberMatching(
        @Query('idUser') idUser: string,
        @Query() dto: Omit<FilterTimeDto, 'idUser'>
    ) {
        return await this.dashboardService.getNumbersMatching(idUser, dto);
    }
}
