import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        // ignoreTLS: true,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_APPPASS,
        },
      },
      // defaults: {
      //   from: `"No Reply" <no-reply@example.com>`
      // },
      // template: {
      //   dir: join(__dirname + "/templates"),
      //   adapter: new HandlebarsAdapter(),
      //   options: {
      //     strict: true,
      //   }
      // }
    })
  ],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}