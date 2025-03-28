import { Room, RoomDocument } from '@entities/room.entities';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateRoomDto, GetRoomDto } from './dto/room.dto';

@Injectable()
export class RoomService {
    constructor(
        @InjectModel(Room.name)
        private readonly roomModel: Model<RoomDocument>,
    ) { }

    async getRoomById(id: string): Promise<GetRoomDto> {
        return this.roomModel.findById(id);
    }

    async createRoom(userId: string, tutorId: string): Promise<any> {
        const newRoom = await new this.roomModel().save();
        newRoom.userId.push(userId)
        newRoom.userId.push(tutorId)
        return newRoom
    }

    async handleCreateRoom(handleCreate: CreateRoomDto){
        const {id, userId, tutorId} = handleCreate

        const isCheck = await this.roomModel.findOne({userId: userId,tutorId: tutorId})
        if(isCheck){
            return "Room is exist"
        }
        return this.createRoom(userId,tutorId)
    }
}
