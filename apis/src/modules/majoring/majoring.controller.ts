import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { MajoringService } from './majoring.service';
import { USER_ROLE } from '@utils/data-types/enums';
import { RequiredByUserRoles } from '@utils/decorator';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateMajoringDto, MajoringDto } from './dto/majoring.dto';

@ApiTags('Majoring')
@Controller()
export class MajoringController {
    constructor(private readonly majoringService: MajoringService) { }

    @RequiredByUserRoles(USER_ROLE.STAFF, USER_ROLE.ADMIN)
    @Post('/new-major')
    async createMajor(@Body() name: MajoringDto) {
        return this.majoringService.createMajor(name);
    }

    @ApiQuery({ name: 'id', type: String, required: false, })
    @RequiredByUserRoles()
    @Get('get-major')
    async getMajor(@Query('id') createMajor: CreateMajoringDto) {
        // console.log(createMajor)
        return this.majoringService.getMajors(createMajor);
    }
}
