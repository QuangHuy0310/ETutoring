import { MoreInformation, MoreInformationDocument } from '@entities/infor.entities';
import { RoomService } from '@modules/index-service';
import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { USER_ERRORS } from '@utils/data-types/constants';
import { Model } from 'mongoose';
import { CreateInforDto, FilterInformationDto, RemoveRoomDto, UpdateDto } from './dto/infor.dto';

@Injectable()
export class InforService {
    constructor(
        @Inject(forwardRef(() => RoomService))
        private readonly roomService: RoomService,

        @InjectModel(MoreInformation.name)
        private readonly moreInformationModel: Model<MoreInformationDocument>,
    ) { }

    async validRoomId(roomId: string): Promise<void> {
        const user = await this.roomService.getRoomById(roomId);
        if (!user) {
            throw new HttpException(USER_ERRORS.WRONG_USER, HttpStatus.NOT_FOUND);
        }
    }

    async handleCreateInfor(user: any, createInforDto: CreateInforDto): Promise<CreateInforDto> {
        createInforDto.userId = user.sub;
        return this.createInfor(createInforDto);
    }

    async createInfor(infor: CreateInforDto): Promise<CreateInforDto> {
        const isChecking = await this.moreInformationModel.findOne({ userId: infor.userId })
        if (isChecking) {
            throw new HttpException(USER_ERRORS.WRONG_USER, HttpStatus.BAD_REQUEST);
        }
        const newInfor = await new this.moreInformationModel(infor).save();
        return infor;
    }

    async getInfor(id: string, userId: string): Promise<any> {
        if (userId) {
            return await this.moreInformationModel.find({ userId });
        }
        return await this.moreInformationModel.find({ userId: id });
    }

    async handleGetInfor(user: any, userId: string) {
        return await this.getInfor(user.sub, userId);

    }

    async getMoreInformationForTutors(filters: FilterInformationDto) {
        const aggregationPipeline: any[] = [
            {
                $match: {
                    deletedAt: null, // Filter out soft-deleted records
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            {
                $unwind: '$user',
            },
            {
                $match: {
                    ...(filters.role ? { 'user.role': filters.role } : {}),
                },
            },
            {
                $project: {
                    user: 0, // Remove the entire `user` field
                },
            },
        ];

        // Add filter conditions if provided
        const matchFilters: any = {};
        if (filters.name) matchFilters.name = { $regex: filters.name, $options: 'i' };
        if (filters.major) matchFilters.major = { $regex: filters.major, $options: 'i' };
        if (filters.country) matchFilters.country = { $regex: filters.country, $options: 'i' };

        if (Object.keys(matchFilters).length > 0) {
            aggregationPipeline.push({ $match: matchFilters });
        }

        return await this.moreInformationModel.aggregate(aggregationPipeline);
    }

    async handlePushId(id: any, roomId: string) {
        const isCheck: string = id.sub
        // await this.validIdUser(userIds)

        const user = await this.moreInformationModel.findOne({ userId: isCheck })
        if (user.roomId.includes(roomId)) {
            throw new HttpException('Room exists already', HttpStatus.BAD_REQUEST);
        }
        return this.pushInRoom(isCheck, roomId)
    }

    async pushInRoom(id: string, userId: string) {
        const user = await this.moreInformationModel.findOne({ userId: id })
        user.roomId.push(userId)
        await user.save()
        return user

    }

    async pushMany(userId: string, tutorId: string, roomId: string) {
        const [user, tutor] = await Promise.all([
            this.moreInformationModel.findOne({ userId: userId }),
            this.moreInformationModel.findOne({ userId: tutorId })
        ])

        user.roomId.push(roomId)
        user.save()

        tutor.roomId.push(roomId)
        tutor.save()
        return `success to add ${user} and ${tutor} to the room ${roomId}`

    }

    async handleGateRoom(user: any) {
        const userId: string = user.sub
        return this.getRoom(userId)
    }
    async getRoom(userId: string) {
        const user = await this.moreInformationModel.findOne({ userId });
        if (!user) {
            throw new HttpException(USER_ERRORS.WRONG_USER, HttpStatus.NOT_FOUND);
        }
        return user.roomId
    }

    // API: Soft delete an information record
    async softDeleteInformation(userId: string): Promise<{ message: string }> {
        const information = await this.moreInformationModel.findOne({ userId });
        if (!information) {
            throw new HttpException('Information not found for this user', HttpStatus.NOT_FOUND);
        }

        if (information.deletedAt) {
            throw new HttpException('Information has already been deleted', HttpStatus.BAD_REQUEST);
        }

        information.deletedAt = new Date();
        await information.save();

        return { message: 'Information soft-deleted successfully' };
    }

    async editInformation(userId: string, payload: UpdateDto): Promise<{ message: string; data: MoreInformation }> {
        const information = await this.moreInformationModel.findOne({ userId });
        if (!information) {
            throw new HttpException('Information not found for this user', HttpStatus.NOT_FOUND);
        }

        if (information.deletedAt) {
            throw new HttpException('Information has been deleted', HttpStatus.BAD_REQUEST);
        }

        // Update fields
        information.name = payload.name;
        information.email = payload.email;
        information.phone = payload.phone;
        information.address = payload.address;
        information.major = payload.major;
        information.country = payload.country;
        information.path = payload.path; 

        const updatedInformation = await information.save();

        return {
            message: 'Information updated successfully',
            data: updatedInformation,
        };
    }

    async removeRoomId(dto: RemoveRoomDto): Promise<any> {
        const { stuId, tutId, roomId } = dto;

        const [student, tutor] = await Promise.all([
            await this.moreInformationModel.updateOne(
                { userId: stuId, roomId: roomId },
                { $pull: { roomId: roomId } }
            ),

            await this.moreInformationModel.updateOne(
                { userId: tutId, roomId: roomId },
                { $pull: { roomId: roomId } }
            )
        ])

        if (student.matchedCount === 0 || tutor.matchedCount === 0) {
            throw new HttpException('User or Room ID not found', HttpStatus.NOT_FOUND);
        }
        return `success to remove roomId ${roomId} from userId ${stuId} and ${tutId}`;
    }
}
