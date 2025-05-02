import { Matching, MatchingDocument } from '@entities/matching.entities';
import { forwardRef, Inject, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateBulkMatchingDto, CreateMatchingDto, FilterStaffDto, GetUserByRoomIdDto } from './dto/matching.dto';
import { NotificationService } from '@modules/notification/notification.service';
import { RoomService } from '@modules/room/room.service';
import { InforService } from '@modules/infor/infor.service'; // Thêm import này
import { MailService } from '@modules/mail/mail.service';
import { create } from 'domain';
import moment from 'moment';

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
    ) { }

    async createMatching(user: any, matching: CreateMatchingDto): Promise<Matching> {
        const staffId = user.sub
        // Tạo phòng chat
        const roomResult = await this.roomService.createRoom(matching.studentId, matching.tutorId);
        if (!roomResult || typeof roomResult !== 'string') {
            throw new HttpException('Failed to create room', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        const newMatching = new this.matchingModel({ ...matching, roomId: roomResult, createdBy: staffId });
        const payload = {
            from: matching.studentId,
            to: matching.tutorId,
        };

        // Lấy thông tin MoreInformation của student và tutor
        const [studentInfos, tutorInfos] = await Promise.all([
            this.inforService.getInfor(matching.studentId, matching.studentId),
            this.inforService.getInfor(matching.tutorId, matching.tutorId),
        ]);


        const studentInfo = studentInfos[0];
        const tutorInfo = tutorInfos[0];



        // Gọi các tác vụ song song
        await Promise.all([
            this.notificationService.createMatchingNotification(
                payload.from,
                payload.to,
                `Matching created between student ${payload.from} and tutor ${payload.to}`,
            ),
            this.mailService.sendMatchingNotificationToStudent(
                studentInfo.email,
                studentInfo.name,
                matching.tutorId,
            ).catch(err => {
                console.error(`Failed to send email to student: ${err.message}`);
            }),
            this.mailService.sendMatchingNotificationToTutor(
                tutorInfo.email,
                tutorInfo.name,
                matching.studentId,
            ).catch(err => {
                console.error(`Failed to send email to tutor: ${err.message}`);
            }),
        ]);

        return newMatching.save();
    }

    async createBulkMatching(user: any, bulkMatching: CreateBulkMatchingDto): Promise<Matching[]> {
        const { studentIds, tutorId, status } = bulkMatching;

        if (studentIds.length > 10) {
            throw new HttpException('Cannot match more than 10 students at a time', HttpStatus.BAD_REQUEST);
        }

        const tutorInfos = await this.inforService.getInfor(tutorId, tutorId);
        if (!tutorInfos || tutorInfos.length === 0) {
            throw new HttpException('MoreInformation not found for tutor', HttpStatus.NOT_FOUND);
        }

        const studentInfosPromises = studentIds.map(studentId =>
            this.inforService.getInfor(studentId, studentId)
        );
        const studentInfosResults = await Promise.all(studentInfosPromises);

        studentInfosResults.forEach((info, index) => {
            if (!info || info.length === 0) {
                throw new HttpException(
                    `MoreInformation not found for student ${studentIds[index]}`,
                    HttpStatus.NOT_FOUND
                );
            }
        });

        const matchings = await Promise.all(
            studentIds.map(async (studentId) => {
                const matchingDto: CreateMatchingDto = {
                    studentId,
                    tutorId,
                    status,
                };
                return this.createMatching(user, matchingDto);
            })
        );

        return matchings;
    }


    async getMatchingByRoomId(roomId: string) {
        const room = await this.matchingModel.findOne({ roomId: roomId })
        const payload = {
            roomId: room.roomId,
            stuId: room.studentId,
            tutId: room.tutorId,
        }
        if (!room) {
            throw new HttpException('Room not found', HttpStatus.NOT_FOUND);
        }

        const update = await room.updateOne({ status: 'off' })

        await this.notificationService.NotificationStatusMatching(payload.stuId, payload.tutId, payload.roomId)

        return await this.inforService.removeRoomId(payload)
    }

    async getUserById(userId: string): Promise<any> {
        const roomDocs = await this.matchingModel.find({
            $or: [{ studentId: userId }, { tutorId: userId }]
        }).select('roomId tutorId studentId').exec()

        if (roomDocs.length === 0) {
            return 0;
        }
        const roomIds = roomDocs.map(room => room.roomId);

        const relatedUsers = roomDocs.map(m => m.studentId === userId ? m.tutorId : m.studentId);
        return { roomIds, relatedUsers }
    }

    async getNumbersMatching(dto: FilterStaffDto) {
        const { start, end, createdBy } = dto;

        return this.matchingModel.aggregate([
            {
                $match: {
                    createdBy: createdBy,
                    createdAt: { $gte: start, $lt: end },
                }
            },
            {
                $project: {
                    month: { $month: "$createdAt" }, 
                }
            },
            {
                $group: {
                    _id: "$month", 
                    count: { $sum: 1 } 
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]).exec();
    }

    async getValueByYear(dto: FilterStaffDto) {
        const { start, end, createdBy } = dto;
        return this.matchingModel.countDocuments({
            createdBy: createdBy,
            createdAt: { $gte: start, $lt: end },
        }).exec();
    }
}