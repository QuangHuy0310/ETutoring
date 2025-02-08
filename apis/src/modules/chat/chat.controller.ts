import { Controller, Post, Body, Get, Query, Request, BadRequestException, Delete } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto, SendMessageDto } from './dto/create-message.dto';
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

  @RequiredByUserRoles(USER_ROLE.USER)
  @Get('history')
  async getMessageHistory(
    @Request() { user }: AuthorizationRequest,
    @Query('receiverId') receiverId: string,
    @Query('limit') limit: number,
    @Query('offset') offset: number,
  ) {
    return await this.chatService.getMessages(user, receiverId, limit, offset);
  }
  @RequiredByUserRoles(USER_ROLE.USER)
  @ApiQuery({ name: 'receiverId', required: false, type: String })
  @ApiQuery({ name: 'groupId', required: false, type: String })
  @Post('send')
  async sendMessage(
    @Request() { user }: AuthorizationRequest,
    @Query('receiverId') receiverId: string,
    @Query('groupId') groupId: string,
    @Body() sendMessageDto: SendMessageDto
  ) {
    if (!sendMessageDto) {
      throw new BadRequestException('Message is required');
    }

    const payload = {
      senderId: user,
      groupId,
      receiverId,
      message: sendMessageDto.message
    };
    await this.chatGateway.sendMessageToReceiver(user,receiverId, payload);
    return { message: 'Message sent', data: payload };
  }

  @RequiredByUserRoles(USER_ROLE.USER)
  @ApiQuery({ name: 'senderId', required: false, type: String })
  @ApiQuery({ name: 'id', required: false, type: String })
  @Delete('remove-message')
  async removeMessage(@Query('senderId') senderId: string, @Query('id') id: string) {
    return await this.chatGateway.handleDeleteMessage({ senderId, id });
  }

}
