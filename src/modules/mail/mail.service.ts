import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
    constructor(private readonly mailService: MailerService) {}

    // Doc: https://nest-modules.github.io/mailer/docs/mailer.html
    async sendMail(to: string, subject: string, text: string, html: string) {
        await this.mailService.sendMail({
            to, from: process.env.EMAIL_USER, subject, text, html
        });
    }
}