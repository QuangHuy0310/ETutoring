import { SlotService } from '@modules/index-service';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { USER_ROLE } from '@utils/data-types/enums';
import { RequiredByUserRoles } from '@utils/decorator';
import { CreateSlotDto } from './dto/slot.dto';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Slot')
@Controller()
export class SlotController {
    constructor(
        private readonly slotService: SlotService
    ) { }

    @RequiredByUserRoles(USER_ROLE.STAFF, USER_ROLE.ADMIN)
    @ApiQuery({ name: 'name', type: String, required: true, example: 'Slot 1' })
    @ApiQuery({ name: 'timeStart', type: String, required: true, })
    @ApiQuery({ name: 'timeEnd', type: String, required: true, })

    @Post('/new-comment')
    async createSlot(@Query() createSlot: CreateSlotDto) {
        return await this.slotService.createSlot(createSlot);
    }

    @RequiredByUserRoles()
    @Get('/get-slot')
    async getSlot() {
        return await this.slotService.getSlot();
    }

    @RequiredByUserRoles()
    @Get('/get-slot-by-id')
    async getSlotById(@Query('id') id: string) {
        return await this.slotService.getSlotById(id);
    }
}
