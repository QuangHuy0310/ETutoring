import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
    constructor(private readonly mailService: MailerService) {}

    async sendMail(to: string, subject: string, text: string, html: string) {
        await this.mailService.sendMail({
            to,
            from: process.env.EMAIL_USER,
            subject,
            text,
            html,
        });
    }

    async sendMatchingNotificationToStudent(studentEmail: string, studentName: string, tutorId: string) {
        const subject = 'You have been matched with a tutor!';
        const text = `Hello ${studentName},\n\nYou have been successfully matched with a tutor (ID: ${tutorId}). Start your learning journey now!\n\nBest regards,\nThe Matching Team`;
        const html = `<h1>Matching Successful!</h1><p>Hello ${studentName},</p><p>You have been matched with a tutor (ID: ${tutorId}). Start your learning journey now!</p><p>Best regards,<br>The Matching Team</p>`;
        await this.sendMail(studentEmail, subject, text, html);
    }

    async sendMatchingNotificationToTutor(tutorEmail: string, tutorName: string, studentId: string) {
        const subject = 'You have been matched with a student!';
        const text = `Hello ${tutorName},\n\nYou have been successfully matched with a student (ID: ${studentId}). Start teaching now!\n\nBest regards,\nThe Matching Team`;
        const html = `<h1>Matching Successful!</h1><p>Hello ${tutorName},</p><p>You have been matched with a student (ID: ${studentId}). Start teaching now!</p><p>Best regards,<br>The Matching Team</p>`;
        await this.sendMail(tutorEmail, subject, text, html);
    }
}