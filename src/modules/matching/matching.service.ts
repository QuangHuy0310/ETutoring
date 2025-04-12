import { Matching, MatchingDocument } from '@entities/matching.entities';
import { forwardRef, Inject, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMatchingDto } from './dto/matching.dto';
import { NotificationService } from '@modules/notification/notification.service';
import { RoomService } from '@modules/room/room.service';
import { UserService } from '@modules/user/user.service';
import { MailService } from '@modules/mail/mail.service';

@Injectable()
export class MatchingService {
    constructor(
        @InjectModel(Matching.name) private matchingModel: Model<MatchingDocument>,
        @Inject(forwardRef(() => NotificationService))
        private readonly notificationService: NotificationService,
        @Inject(forwardRef(() => RoomService))
        private readonly roomService: RoomService,
        private readonly userService: UserService,
        private readonly mailService: MailService
    ) {}

    async createMatching(matching: CreateMatchingDto): Promise<Matching> {
        const newMatching = new this.matchingModel(matching);
        const payload = {
            from: matching.studentId,
            to: matching.tutorId,
        };

        await Promise.all([
            // Pass a custom title for p0, even though createMatchingNotification doesn't use it
            this.notificationService.createMatchingNotification(
                payload.from,
                payload.to,
                `Matching created between student ${payload.from} and tutor ${payload.to}`
            ),
            this.roomService.createRoom(payload.from, payload.to),
            // Fetch student and tutor information from the users collection
            (async () => {
                const student = await this.userService.findById(matching.studentId);
                const tutor = await this.userService.findById(matching.tutorId);

                // Throw an error if student or tutor is not found
                if (!student || !tutor) {
                    throw new HttpException('Student or tutor not found', HttpStatus.NOT_FOUND);
                }

                // Prepare email content for the student
                const studentSubject = 'You have been matched with a tutor!';
                const studentText = `Hello,\n\nYou have been successfully matched with a tutor (ID: ${matching.tutorId}). Start your learning journey now!\n\nBest regards,\nThe Matching Team`;
                const studentHtml = `<h1>Matching Successful!</h1><p>You have been matched with a tutor (ID: ${matching.tutorId}). Start your learning journey now!</p><p>Best regards,<br>The Matching Team</p>`;

                // Prepare email content for the tutor
                const tutorSubject = 'You have been matched with a student!';
                const tutorText = `Hello,\n\nYou have been successfully matched with a student (ID: ${matching.studentId}). Start teaching now!\n\nBest regards`;
                const tutorHtml = `<h1>Matching Successful!</h1><p>You have been matched with a student (ID: ${matching.studentId}). Start teaching now!</p><p>Best regards</p>`;

                // Send emails to student and tutor
                await Promise.all([
                    this.mailService.sendMail(student.email, studentSubject, studentText, studentHtml).catch(err => {
                        console.error(`Failed to send email to student: ${err.message}`);
                    }),
                    this.mailService.sendMail(tutor.email, tutorSubject, tutorText, tutorHtml).catch(err => {
                        console.error(`Failed to send email to tutor: ${err.message}`);
                    }),
                ]);
            })()
        ]);

        return newMatching.save();
    }
}