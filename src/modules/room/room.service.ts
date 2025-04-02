import { Room, RoomDocument } from '@entities/room.entities';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateRoomDto, GetRoomDto } from './dto/room.dto';
import { InforService } from '@modules/index-service';

@Injectable()
export class RoomService {
    constructor(
        @InjectModel(Room.name)
        private readonly roomModel: Model<RoomDocument>,

        @Inject(forwardRef(() => InforService))
        private readonly inforService: InforService,
    ) { }

    async getRoomById(id: string): Promise<GetRoomDto> {
        return this.roomModel.findById(id);
    }

    async createRoom(userId: string, tutorId: string): Promise<any> {
        const newRoom = await new this.roomModel()
        newRoom.userId.push(userId)
        newRoom.userId.push(tutorId)
        newRoom.save()
        
        return this.inforService.pushMany(userId,tutorId,newRoom._id)
    }

    async handleCreateRoom(handleCreate: CreateRoomDto) {
        const { userId, tutorId } = handleCreate

        const isCheck = await this.roomModel.findOne({ userId: userId, tutorId: tutorId })
        if (isCheck) {
            return "Room is exist"
        }
        return this.createRoom(userId, tutorId)
    }
}
