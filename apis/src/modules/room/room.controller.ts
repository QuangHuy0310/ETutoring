import { RoomService } from '@modules/room/room.service';
import { Controller, Get, Post, Query } from '@nestjs/common';
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
    
    @RequiredByUserRoles()
    @Get('get-user-by-roomId')
    async getUserByRoomId(@Query('roomId') roomId: string) {
        return this.roomService.getUserByRoomId(roomId);
    }

 }
