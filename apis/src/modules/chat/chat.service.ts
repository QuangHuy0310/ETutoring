import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from '@entities/message.entities';
import { CreateChatDto, VerifyChatDto } from './dto/create-message.dto';
import { UserService } from '@modules/index-service';
import { UUID } from 'crypto';
import { USER_ERRORS } from '@utils/data-types/constants';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private readonly chatModel: Model<Message>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) { }

  async create(createChatDto: CreateChatDto) {
    createChatDto.senderId = createChatDto.senderId.sub;
    const chat = new this.chatModel(createChatDto);
    return chat.save();
  }

  async getMessages(user: any, receiverId: string, limit = 20, offset = 0) {
    const senderId = user.sub
    return this.chatModel
      .find({
        $or: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
        deletedAt: null
      })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .exec();
  }
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
