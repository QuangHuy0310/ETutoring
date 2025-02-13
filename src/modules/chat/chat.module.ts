import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { forwardRef, Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from '@entities/message.entities';
import { JwtService } from '@nestjs/jwt';
import { UserModule } from '@modules/user/user.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
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
    ChatService, SocketGateway,],
  exports: [SocketGateway]
    
})
export class ChatModule { }
