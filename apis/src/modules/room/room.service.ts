import { Room, RoomDocument } from '@entities/room.entities';
import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateRoomDto, GetRoomDto } from './dto/room.dto';
import { InforService } from '@modules/index-service';
import { USER_ERRORS } from '@utils/data-types/constants';

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

    async validRoom(a: string, b: string): Promise<void> {
        const isCheck = await this.roomModel.findOne({ userId: a, tutorId: b })
        if (isCheck) {
            throw new HttpException(USER_ERRORS.ROOM_EXISTED, HttpStatus.BAD_REQUEST);
        }
    }

    async createRoom(userId: string, tutorId: string): Promise<any> {
        // await this.validRoom(userId,tutorId)

        const newRoom = await new this.roomModel()
        newRoom.userId.push(userId)
        newRoom.userId.push(tutorId)
        await newRoom.save()

        return this.inforService.pushMany(userId, tutorId, newRoom._id)
    }

    async handleCreateRoom(handleCreate: CreateRoomDto) {
        const { userId, tutorId } = handleCreate

        const isCheck = await this.roomModel.findOne({ userId: userId, tutorId: tutorId })
        if (isCheck) {
            return "Room is exist"
        }
        return this.createRoom(userId, tutorId)
    }

    async getUserByRoomId(roomId: string): Promise<any> {
        const result = await this.roomModel.aggregate([
            {
                $match: { _id: roomId, deletadAt: null }
            },
            {
                $lookup: {
                    from: 'moreinformations',
                    localField: 'userId',
                    foreignField: 'userId',
                    as: 'userInfos'
                }
            },
            {
                $unwind: '$userInfos' 
            },
            {
                $replaceRoot: { newRoot: '$userInfos' } 
            },
            {
                $project: {
                    _id: 0,
                    userId: 1,
                    name: 1
                }
            }
        ]);
        return result;
    }
}
