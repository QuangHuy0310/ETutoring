import { Body, Controller, Delete, Get, Post, Put, Query } from '@nestjs/common';
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
    async getMajor(@Query("id") createMajor: string) {
        return this.majoringService.getMajors(createMajor);
    }

    @ApiQuery({ name: 'id', type: String, required: true })
    @RequiredByUserRoles(USER_ROLE.STAFF, USER_ROLE.ADMIN)
    @Put('/edit-major')
    async updateMajor(
        @Query('id') id: string,
        @Body() updateMajorDto: MajoringDto,
    ) {
        return this.majoringService.updateMajor(id, updateMajorDto);
    }

    @ApiQuery({ name: 'id', type: String, required: true })
    @RequiredByUserRoles(USER_ROLE.STAFF, USER_ROLE.ADMIN)
    @Delete('/delete-major')
    async deleteMajor(@Query('id') id: string) {
        await this.majoringService.deleteMajor(id);
        return { message: 'Major deleted successfully' };
    }
}
