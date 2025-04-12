import { MatchingRequest, MatchingRequestDocument } from '@entities/matchingRequest.entities';
import { Matching, MatchingDocument } from '@entities/matching.entities';
import { forwardRef, Inject, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationService } from '@modules/notification/notification.service';
import { UserService } from '@modules/user/user.service';
import { MatchingService } from '@modules/matching/matching.service';
import { SocketGateway } from '@modules/chat/socket.gateway';
import { CreateMatchingRequestDto } from './dto/matchingRequest.dto';

@Injectable()
export class MatchingRequestService {
    constructor(
        @InjectModel(MatchingRequest.name) private matchingRequestModel: Model<MatchingRequestDocument>,
        @InjectModel(Matching.name) private matchingModel: Model<MatchingDocument>,
        @Inject(forwardRef(() => NotificationService))
        private readonly notificationService: NotificationService,
        private readonly userService: UserService,
        @Inject(forwardRef(() => MatchingService))
        private readonly matchingService: MatchingService,
        @Inject(forwardRef(() => SocketGateway))
        private readonly socketGateway: SocketGateway,
    ) {}

    // Send a matching request from student to staff
    async sendMatchingRequest(requestDto: CreateMatchingRequestDto): Promise<MatchingRequest> {
        // Check if student and tutor exist
        const student = await this.userService.findById(requestDto.studentId);
        const tutor = await this.userService.findById(requestDto.tutorId);

        // Create a new matching request
        const newRequest = new this.matchingRequestModel({
            studentId: requestDto.studentId,
            tutorId: requestDto.tutorId,
            status: 'pending',
        });

        // Notify staff
        const staffUsers = await this.userService.getAllUsers();
        const staffList = staffUsers.filter(user => user.role === 'staff');
        await Promise.all(
            staffList.map(staff =>
                this.notificationService.createMatchingRequestNotification(
                    requestDto.studentId,
                    staff._id.toString(),
                    requestDto.tutorId
                )
            )
        );

        return newRequest.save();
    }
}