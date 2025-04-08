import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from '@entities/message.entities';
import { CreateChatDto, InputMessageDto, VerifyChatDto } from './dto/create-message.dto';
import { UserService } from '@modules/index-service';
import { UUID } from 'crypto';
import { USER_ERRORS } from '@utils/data-types/constants';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { GetMessageDto } from './dto/get-message.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private readonly chatModel: Model<MessageDocument>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,

    @Inject(CACHE_MANAGER) private cacheManager: any,
  ) { }

  async createMessage(data: CreateChatDto): Promise<CreateChatDto> {
    const message = await this.chatModel.create({
      ...data,
      createdAt: new Date(),
    });

    const cacheKeyPrefix = `chat:${data.roomId}`;
    const keys = [20, 50, 100].map(limit => `${cacheKeyPrefix}:${limit}`);

    // Xóa nhiều limit nếu cần - hỗ trợ soft invalidate
    await Promise.all(keys.map(key => this.cacheManager.del(key)));

    return message;
  }



  // Lấy tin nhắn theo roomId
  async getMessagesByRoomId(dto: GetMessageDto) {
    const { roomId, limit, senderId, path, document, createdAt } = dto;

    const query: any = {
      deletedAt: null,
      roomId: roomId,
    };

    // Chỉ filter theo path/document khi có senderId
    if (senderId) {
      query.senderId = senderId;

      if (typeof path !== 'undefined') {
        query.path = path === 'true' ? { $ne: null } : null;
      }

      if (typeof document !== 'undefined') {
        query.document = document === 'true' ? { $ne: null } : null;
      }
    }

    if (createdAt) {
      query.createdAt = { $lt: new Date(createdAt) };
    }

    // Tạo cache key theo logic
    const cacheParts = [roomId, limit ?? 50, senderId ?? ''];

    if (senderId) {
      cacheParts.push(path ?? '', document ?? '');
    }

    if (createdAt) {
      cacheParts.push(createdAt);
    }

    const cacheKey = `chat:${cacheParts.join(':')}`;

    const cache: Cache = this.cacheManager as Cache;
    const cachedMessages = await cache.get(cacheKey);
    if (cachedMessages) {
      return cachedMessages;
    }

    const messages = await this.chatModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit ?? 50)
      .exec();

    await cache.set(cacheKey, messages, 300); // TTL 5 phút

    return messages;
  }



  //
  async validationSender(id: UUID): Promise<void> {
    const senderId = this.userService.findById(id)
    if (!senderId) {
      throw new HttpException(USER_ERRORS.SENDER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
  }

  async validationReceiver(id: UUID): Promise<void> {
    const receiverId = this.userService.findById(id)
    if (!receiverId) {
      throw new HttpException(USER_ERRORS.RECEIVER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
  }

  async deleteMessage(senderId: string, id: string): Promise<string> {
    await this.chatModel.findByIdAndDelete(id)
    return "success for deleteMessage "
  }
}
