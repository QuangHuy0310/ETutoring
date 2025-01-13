import { Controller, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-message.dto';
import { ChatGateway } from './chat.gateway';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @Post('sendMessage')
  async sendMessage(@Body() createChatDto: CreateChatDto) {
    // Lưu tin nhắn vào database
    const savedMessage = await this.chatService.create(createChatDto);

    // Phát tin nhắn tới người nhận qua WebSocket
    this.chatGateway.sendMessageToReceiver(createChatDto.receiverId, savedMessage);

    return {
      status: 'Message sent',
      data: savedMessage,
    };
  }
}
