import { MatchingRequest, MatchingRequestDocument } from '@entities/matchingRequest.entities';
import { Matching, MatchingDocument } from '@entities/matching.entities';
import { forwardRef, Inject, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationService } from '@modules/notification/notification.service';
import { UserService } from '@modules/user/user.service';
import { MatchingService } from '@modules/matching/matching.service';
import { SocketGateway } from '@modules/chat/socket.gateway';
import { CreateMatchingRequestDto, UpdateMatchingRequestStatusDto } from './dto/matchingRequest.dto';
import { USER_ROLE } from '@utils/data-types/enums';

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

    // Send a matching request from student to staff (đã có sẵn)
    async sendMatchingRequest(requestDto: CreateMatchingRequestDto): Promise<MatchingRequest> {
        const student = await this.userService.findById(requestDto.studentId);
        const tutor = await this.userService.findById(requestDto.tutorId);

        const newRequest = new this.matchingRequestModel({
            studentId: requestDto.studentId,
            tutorId: requestDto.tutorId,
            status: 'pending',
        });

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

    // Get list of matching requests
    async getMatchingRequests(user: any, status?: string): Promise<MatchingRequest[]> {
        const query: any = {};

        // If user is a student, only show their own requests
        if (user.role === USER_ROLE.USER) {
            query.studentId = user._id;
        }

        // Filter by status if provided
        if (status) {
            query.status = status;
        }

        return this.matchingRequestModel.find(query).exec();
    }

    // Update status of a matching request (only for staff)
    async updateMatchingRequestStatus(
        requestId: string,
        statusDto: UpdateMatchingRequestStatusDto,
        staffId: string
    ): Promise<MatchingRequest> {
        const matchingRequest = await this.matchingRequestModel.findById(requestId).exec();
        if (!matchingRequest) {
            throw new HttpException('Matching request not found', HttpStatus.NOT_FOUND);
        }

        // Update status and staffId
        matchingRequest.status = statusDto.status;
        matchingRequest.staffId = staffId;

        // If the request is accepted, create a new Matching record
        if (statusDto.status === 'accepted') {
            const newMatching = new this.matchingModel({
                studentId: matchingRequest.studentId,
                tutorId: matchingRequest.tutorId,
                status: 'on',
            });
            await newMatching.save();

            // Notify both student and tutor about the successful match
            await this.notificationService.createMatchingNotification(
                matchingRequest.studentId,
                matchingRequest.tutorId,
                `Matching successful between student ${matchingRequest.studentId} and tutor ${matchingRequest.tutorId}`
            );
        }

        return matchingRequest.save();
    }
}