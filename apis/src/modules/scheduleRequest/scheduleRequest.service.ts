import { ScheduleRequest, ScheduleRequestDocument } from '@entities/ScheduleRequest.entities';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InputScheduleDto, ScheduleRequestDto, ScheduleRequestNotiDto, ScheduleRequestUpdateDto } from './dto/scheduleRequest.dto';
import { NotificationService } from '@modules/notification/notification.service';
import { days } from '@nestjs/throttler';
import { ScheduleService } from '@modules/schedule/schedule.service';

@Injectable()
export class ScheduleRequestService {
    constructor(
        @InjectModel(ScheduleRequest.name)
        private readonly scheduleRequestModel: Model<ScheduleRequestDocument>,
        @Inject(forwardRef(() => NotificationService))
        private readonly notificationService: NotificationService,
        @Inject(forwardRef(() => ScheduleService))
        private readonly scheduleService: ScheduleService,

    ) { }

    async handleScheduleRequest(user: any, dto: InputScheduleDto): Promise<ScheduleRequestDocument> {
        const senderId = user.sub
        const { reciverId, days, slotId } = dto

        const payload = {
            senderId,
            reciverId,
            status: 'pending',
            days,
            slotId,
        }

        await this.notificationService.notificationScheduleRequest(senderId, reciverId)

        return await this.createScheduleRequest(payload)
    }

    async createScheduleRequest(dto: ScheduleRequestDto): Promise<ScheduleRequestDocument> {
        const newScheduleRequest = new this.scheduleRequestModel(dto);
        return newScheduleRequest.save();
    }

    async getScheduleRequestForReciver(reciverId: string, senderId: string): Promise<ScheduleRequestDocument[]> {
        return this.scheduleRequestModel.find({
            reciverId: reciverId,
            senderId: senderId,
            deleteAt: null,
            status: 'pending',
        }).exec();
    }

    async getScheduleRequestForSender(senderId: string, receiverId: string): Promise<ScheduleRequestDocument[]> {
        return this.scheduleRequestModel.find({
            senderId: senderId,
            reciverId: receiverId,
        }).exec();
    }

    async updateScheduleRequest(dto: ScheduleRequestUpdateDto): Promise<ScheduleRequestDocument> {
        const { id, status } = dto;

        await this.notificationScheduleRequest(dto)
        return this.scheduleRequestModel.findByIdAndUpdate(id, { status: status }, { new: true }).exec()
    }

    async notificationScheduleRequest(dto: ScheduleRequestNotiDto): Promise<ScheduleRequestNotiDto> {
        const { id, status } = dto;

        const user = await this.scheduleRequestModel.findById(id)

        if (!user) {
            throw new Error('Schedule request not found');
        }

        if (status === 'accepted') {
            const payload = {
                userId: user.senderId,
                days: user.days,
                slotId: user.slotId,
                partnerId: user.reciverId,
            }
            await this.scheduleService.handleCreateSchedule(payload)
            return this.notificationService.notificationForSender(user.senderId, user.reciverId, user.slotId, user.days)
        }

        return this.notificationService.notificationForSender(id, user.senderId, user.reciverId, status)
    }
}
