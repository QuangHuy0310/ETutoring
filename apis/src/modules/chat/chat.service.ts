import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from '@entities/message.entities';
import { CreateChatDto } from './dto/create-message.dto';

@Injectable()
export class ChatService {
  constructor(@InjectModel(Message.name) private readonly chatModel: Model<Message>) {}

  async create(createChatDto: CreateChatDto) {
    // Chuyển đổi CreateChatDto thành object
    const chat = new this.chatModel(createChatDto);  // Truyền dữ liệu đối tượng vào đây
    return chat.save();  // Lưu vào MongoDB
  }

  async findChatHistory(senderId: string, receiverId: string) {
    return this.chatModel.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ timestamp: 1 });
  }
}
