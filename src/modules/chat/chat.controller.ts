import { Controller, Post, Body, Get, Query, Request, BadRequestException, Delete, Param } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto, InputMessageDto, SendMessageDto } from './dto/create-message.dto';
import { SocketGateway } from './socket.gateway';
import { RequiredByUserRoles } from '@utils/decorator';
import { USER_ROLE } from '@utils/data-types/enums';
import { AuthorizationRequest } from '@utils/data-types/types';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
@ApiTags('Chat')

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatGateway: SocketGateway,
  ) { }
  @RequiredByUserRoles()
  @ApiQuery({ name: 'roomId', type: String, required: true })
  @ApiQuery({ name: 'receiverId', type: String, required: true })
  @ApiQuery({ name: 'message', type: String, required: true })
  @Post('newMessage')
  async sendMessage(
    @Request() { user }: AuthorizationRequest,
    @Query() input: InputMessageDto,
  ) {
    return await this.chatGateway.sendMessageToRoom(user, input);
  }

  // API lấy tất cả tin nhắn theo roomId
  @Get(':roomId')
  async getMessages(@Param('roomId') roomId: string) {
    return await this.chatService.getMessagesByRoom(roomId);
  }

}
