import { MoreInformation, MoreInformationDocument } from '@entities/infor.entities';
import { UserService } from '@modules/index-service';
import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { USER_ERRORS } from '@utils/data-types/constants';
import { Model } from 'mongoose';
import { CreateInforDto, FilterInformationDto, GetInforDto, UpdateDto } from './dto/infor.dto';

@Injectable()
export class InforService {
    constructor(
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,

        @InjectModel(MoreInformation.name)
        private readonly moreInformationModel: Model<MoreInformationDocument>,
    ) { }

    async validUserId(userId: string): Promise<void> {
        const user = await this.userService.findById(userId);
        if (!user) {
            throw new HttpException(USER_ERRORS.WRONG_USER, HttpStatus.NOT_FOUND);
        }
    }

    async handleCreateInfor(user: any, createInforDto: CreateInforDto): Promise<CreateInforDto> {
        createInforDto.userId = user.sub;
        return this.createInfor(createInforDto);
    }

    async createInfor(infor: CreateInforDto): Promise<CreateInforDto> {
        const newInfor = await new this.moreInformationModel(infor).save();
        return infor;
    }

    async getInfor(userId: string): Promise<any> {
        // Filter out soft-deleted records
        const user = await this.moreInformationModel
            .findOne({ userId, deletedAt: null }) // Only retrieve records that are not soft-deleted
            .lean();

        if (!user) {
            return null;
        }

        const historyUsers = await this.moreInformationModel
            .find({
                userId: { $in: user.historyUserId },
                deletedAt: null, // Only retrieve history users that are not soft-deleted
            })
            .select('name path')
            .lean();

        return {
            ...user,
            historyUserId: historyUsers,
        };
    }

    async handleGetInfor(user: any) {
        return await this.getInfor(user.sub);
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
                    'user.role': 'tutor',
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

    async validIdUser(userId: string): Promise<void> {
        const user = await this.userService.findById(userId);
        if (!user) {
            throw new HttpException(USER_ERRORS.WRONG_USER, HttpStatus.NOT_FOUND);
        }
    }

    async handlePushId(id: any, userIds: string) {
        const isCheck: string = id.sub;
        await this.validIdUser(userIds);

        const user = await this.moreInformationModel.findOne({ userId: isCheck });
        if (user.historyUserId.includes(userIds)) {
            throw new HttpException('User exists already', HttpStatus.BAD_REQUEST);
        }
        return this.pushIdUser(isCheck, userIds);
    }

    async pushIdUser(id: string, userId: string) {
        const user = await this.moreInformationModel.findOne({ userId: id });
        user.historyUserId.push(userId);
        await user.save();
        return user;
    }

    // API: Update information
    async updateInfor(id: string, payload: UpdateDto): Promise<MoreInformation> {
        const existingInfor = await this.moreInformationModel.findById(id);
        if (!existingInfor) {
            throw new HttpException('Information not found', HttpStatus.NOT_FOUND);
        }
        if (existingInfor.deletedAt) {
            throw new HttpException('Information has been deleted', HttpStatus.BAD_REQUEST);
        }

        Object.assign(existingInfor, payload); // Update fields from payload
        return existingInfor.save();
    }

    // API: Soft delete information
    async softDeleteInfor(id: string): Promise<void> {
        const existingInfor = await this.moreInformationModel.findById(id);
        if (!existingInfor) {
            throw new HttpException('Information not found', HttpStatus.NOT_FOUND);
        }
        if (existingInfor.deletedAt) {
            throw new HttpException('Information has already been deleted', HttpStatus.BAD_REQUEST);
        }

        existingInfor.deletedAt = new Date(); // Mark as soft-deleted
        await existingInfor.save();
    }
}