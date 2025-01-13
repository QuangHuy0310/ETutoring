import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from '@entities/message.entities';
import { JwtService } from '@nestjs/jwt';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
              name: Message.name,
              schema: MessageSchema,
            },
          ]),
    ],
    controllers: [
        ChatController,],
    providers: [
        ChatService, ChatGateway],
})
export class ChatModule { }
