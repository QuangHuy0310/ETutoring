import { Schedule, ScheduleDocument } from '@entities/schedule.entities';
import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateScheduleDto, InputScheduleDto, QueryScheduleDto } from './dto/schedule.dto';
import { USER_ERRORS } from '@utils/data-types/constants';
import { UserService } from '@modules/user/user.service';
import { SlotService } from '@modules/slot/slot.service';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

@Injectable()
export class ScheduleService {
    constructor(

        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,

        @Inject(forwardRef(() => SlotService))
        private readonly slotService: SlotService,

        @InjectModel(Schedule.name)
        private readonly scheduleModel: Model<ScheduleDocument>,
    ) { }

    async validUserId(userId: string): Promise<void> {
        const user = this.userService.findById(userId);
        if (!user) {
            throw new HttpException(USER_ERRORS.WRONG_USER, HttpStatus.NOT_FOUND);
        }
    }

    async validSlotId(slotId: string): Promise<void> {
        const slot = this.slotService.getSlotById(slotId)
        if (!slot) {
            throw new HttpException(USER_ERRORS.INVALID_SLOT, HttpStatus.NOT_FOUND);
        }
    }


    async handleCreateSchedule(inputSchedule: InputScheduleDto) {
        this.validUserId(inputSchedule.userId)
        this.validSlotId(inputSchedule.slotId)


        const userId = inputSchedule.userId
        const slotId = inputSchedule.slotId


        const [day, month, year] = inputSchedule.days.split('/').map(Number);
        const date = new Date(Date.UTC(year, month - 1, day)).getTime();

        const isCheck = await this.scheduleModel.findOne({
            userId: userId,
            deleteAt: null,
            days: date
        })

        if (isCheck && isCheck.slotId === slotId) {
            throw new HttpException(USER_ERRORS.SCHEDULE_EXISTED, HttpStatus.BAD_REQUEST);
        }

        return await this.createSchedule({ ...inputSchedule, days: date })
    }

    async createSchedule(createSchedule: CreateScheduleDto): Promise<Schedule> {
        const newSchedule = new this.scheduleModel(createSchedule);
        return newSchedule.save();
    }


    async getSchedule(query: QueryScheduleDto): Promise<Schedule[]> {
        const { userId, week, month, year } = query;

        let filter: any = { userId };

        if (week && month && year) {
            const firstDayOfMonth = new Date(year, month - 1, 1); 
            const startOfSelectedWeek = startOfWeek(new Date(firstDayOfMonth.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000), { weekStartsOn: 1 });
            const endOfSelectedWeek = endOfWeek(startOfSelectedWeek, { weekStartsOn: 1 });

            filter.days = {
                $gte: startOfSelectedWeek.getTime(),
                $lte: endOfSelectedWeek.getTime()
            };
        }
        else if (month && year) {
            const startOfSelectedMonth = startOfMonth(new Date(year, month - 1));
            const endOfSelectedMonth = endOfMonth(startOfSelectedMonth);

            filter.days = {
                $gte: startOfSelectedMonth.getTime(),
                $lte: endOfSelectedMonth.getTime()
            };
        }

        const schedules = await this.scheduleModel.find(filter);

        return schedules;
    }


}
