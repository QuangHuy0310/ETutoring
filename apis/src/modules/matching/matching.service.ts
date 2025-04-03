import { Matching, MatchingDocument } from '@entities/matching.entities';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMatchingDto } from './dto/matching.dto';
import { NotificationService } from '@modules/notification/notification.service';
import { RoomService } from '@modules/room/room.service';

@Injectable()
export class MatchingService {
    constructor(
        @InjectModel(Matching.name) private matchingModel: Model<MatchingDocument>,
        @Inject(forwardRef(() => NotificationService))
        private readonly notificationService: NotificationService,

        @Inject(forwardRef(() => RoomService))
        private readonly roomService: RoomService,
    ) { }

    async createMatching(matching: CreateMatchingDto): Promise<Matching> {
        const newMatching = new this.matchingModel(matching);
        const payload = {
            from: matching.studentId,
            to: matching.tutorId,
        }
        await Promise.all([
            this.notificationService.createMatchingNotification(payload.from, payload.to),
            this.roomService.createRoom(payload.from, payload.to)

        ])
        return newMatching.save();
    }
}