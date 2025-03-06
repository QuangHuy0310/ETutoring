import { MoreInformation, MoreInformationDocument } from '@entities/infor.entities';
import { UserService } from '@modules/index-service';
import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { USER_ERRORS } from '@utils/data-types/constants';
import { Model } from 'mongoose';
import { CreateInforDto, FilterInformationDto, GetInforDto } from './dto/infor.dto';

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
        const newInfor = new this.moreInformationModel(infor).save();
        return infor
    }

    getInfor(userId: string) {
        return this.moreInformationModel.find({ userId: userId })
    }

    async handleGetInfor(user: any): Promise<MoreInformation[]> {
        return this.getInfor(user.sub)

    }


    async getMoreInformationForTutors(filters: FilterInformationDto) {
        const aggregationPipeline: any[] = [
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
                    user: 0, // Loại bỏ toàn bộ trường `user`
                  },
            }
        ];

        // Thêm các điều kiện lọc nếu có
        const matchFilters: any = {};
        if (filters.name) matchFilters.name = { $regex: filters.name, $options: 'i' };
        if (filters.major) matchFilters.major = { $regex: filters.major, $options: 'i' };
        if (filters.country) matchFilters.country = { $regex: filters.country, $options: 'i' };

        if (Object.keys(matchFilters).length > 0) {
            aggregationPipeline.push({ $match: matchFilters });
        }

        return this.moreInformationModel.aggregate(aggregationPipeline);
    }
}
