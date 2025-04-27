import { RoomService } from '@modules/room/room.service';
import { Controller, Get, Post, Query } from '@nestjs/common';
import { RequiredByUserRoles } from '@utils/decorator';
import { CreateRoomDto, GetUserByRoomIdDto, PaginationDto } from './dto/room.dto';
import { ApiQuery } from '@nestjs/swagger';

@Controller()
export class RoomController {
    constructor(
        private readonly roomService: RoomService
    ) { }

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

    @RequiredByUserRoles()
    @Get('get-room-by-ids')
    @ApiQuery({ name: 'user1', type: String, required: true })
    @ApiQuery({ name: 'user2', type: String, required: true })
    async getRoomByIds(@Query() dto: GetUserByRoomIdDto) {
        return this.roomService.getRoomByUserIds(dto);
    }

    @RequiredByUserRoles()
    @Get('get-all-room')
    @ApiQuery({ name: 'page', type: Number, required: false })
    @ApiQuery({ name: 'limit', type: Number, required: false })
    async getAllRoom(@Query() dto: PaginationDto) {
        return this.roomService.getAllRoom(dto);
    }

}
