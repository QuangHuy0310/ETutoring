import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { forwardRef, Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from '@entities/message.entities';
import { JwtService } from '@nestjs/jwt';
import { UserModule } from '@modules/user/user.module';
import { InforModule } from '@modules/infor/infor.module';
import * as redisStore from 'cache-manager-redis-store';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { MessageProcessor } from './chat.processor';
@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => InforModule),
    MongooseModule.forFeature([
      {
        name: Message.name,
        schema: MessageSchema,
      },
    ]),
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      ttl: 300000, // Cache 5 phút
    }),
    BullModule.registerQueue({
      name: 'messageQueue', // Tên queue
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
      },
    }),
  ],
  controllers: [
    ChatController,],
  providers: [
    ChatService, SocketGateway,MessageProcessor],
  exports: [SocketGateway]

})
export class ChatModule { }
