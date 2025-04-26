import { Matching, MatchingDocument } from '@entities/matching.entities';
import { forwardRef, Inject, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMatchingDto } from './dto/matching.dto';
import { NotificationService } from '@modules/notification/notification.service';
import { RoomService } from '@modules/room/room.service';
import { InforService } from '@modules/infor/infor.service'; // Thêm import này
import { MailService } from '@modules/mail/mail.service';

@Injectable()
export class MatchingService {
    constructor(
        @InjectModel(Matching.name) private matchingModel: Model<MatchingDocument>,
        @Inject(forwardRef(() => NotificationService))
        private readonly notificationService: NotificationService,
        @Inject(forwardRef(() => RoomService))
        private readonly roomService: RoomService,
        private readonly inforService: InforService,
        private readonly mailService: MailService,
    ) {}

    async createMatching(matching: CreateMatchingDto): Promise<Matching> {
        const newMatching = new this.matchingModel(matching);
        const payload = {
            from: matching.studentId,
            to: matching.tutorId,
        };

        const [studentInfos, tutorInfos] = await Promise.all([
            this.inforService.getInfor(matching.studentId, matching.studentId),
            this.inforService.getInfor(matching.tutorId, matching.tutorId),
        ]);


        const studentInfo = studentInfos[0];
        const tutorInfo = tutorInfos[0];

        const roomResult = await this.roomService.createRoom(matching.studentId, matching.tutorId);

        if (!roomResult || typeof roomResult !== 'string') {
            throw new HttpException('Failed to create room', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        const roomIdMatch = roomResult.match(/room ([^ ]+)/);
        if (!roomIdMatch || !roomIdMatch[1]) {
            throw new HttpException('Failed to extract roomId from room creation result', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        const roomId = roomIdMatch[1];

        // Gọi các tác vụ song song
        await Promise.all([
            this.notificationService.createMatchingNotification(
                payload.from,
                payload.to,
                `Matching created between student ${payload.from} and tutor ${payload.to}`,
            ),
            this.mailService.sendMatchingNotificationToStudent(
                studentInfo.email,
                studentInfo.name || 'Student',
                matching.tutorId,
            ).catch(err => {
                console.error(`Failed to send email to student: ${err.message}`);
            }),
            this.mailService.sendMatchingNotificationToTutor(
                tutorInfo.email,
                tutorInfo.name || 'Tutor',
                matching.studentId,
            ).catch(err => {
                console.error(`Failed to send email to tutor: ${err.message}`);
            }),
        ]);

        return newMatching.save();
    }
}