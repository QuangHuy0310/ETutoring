import { RoomService } from '@modules/room/room.service';
import { Controller, Post, Query } from '@nestjs/common';
import { RequiredByUserRoles } from '@utils/decorator';
import { CreateRoomDto } from './dto/room.dto';

@Controller()
export class RoomController {
    constructor(
        private readonly roomService: RoomService
    ) {}

    @RequiredByUserRoles()
    @Post('room')
    async createRoom(@Query() input: CreateRoomDto) {
        return this.roomService.handleCreateRoom(input);
    }

 }
