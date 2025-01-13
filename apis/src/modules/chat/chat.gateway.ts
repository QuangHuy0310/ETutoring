import { WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, MessageBody, WsResponse, ConnectedSocket } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-message.dto'

@WebSocketGateway(3001, { transports: ['websocket'] })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly chatService: ChatService) {}

  private clients: { [key: string]: Socket } = {};

  // Khi người dùng kết nối vào WebSocket
  handleConnection(client: Socket) {
    console.log('User connected:', client.id);
    this.clients[client.id] = client;
  }

  // Khi người dùng ngắt kết nối
  handleDisconnect(client: Socket) {
    console.log('User disconnected:', client.id);
    delete this.clients[client.id];
  }

  // Lắng nghe sự kiện `sendMessage` từ người dùng
  @SubscribeMessage('sendMessage')
  async handleMessage(@MessageBody() createChatDto: CreateChatDto, @ConnectedSocket() client: Socket): Promise<WsResponse<any>> {
    console.log('Received message:', createChatDto);

    // Lưu tin nhắn vào database
    const savedMessage = await this.chatService.create(createChatDto);

    // Gửi tin nhắn tới người nhận
    this.sendMessageToReceiver(createChatDto.receiverId, savedMessage);

    return { event: 'receiveMessage', data: savedMessage };
  }

  // Phương thức gửi tin nhắn tới người nhận qua ID
  sendMessageToReceiver(receiverId: string, message: any): void {
    // Kiểm tra nếu người nhận đang kết nối (đã join phòng)
    const receiverClient = this.clients[receiverId];
    if (receiverClient) {
      receiverClient.emit('receiveMessage', message);  // Gửi tin nhắn cho client nhận
    } else {
      console.log(`Receiver with ID ${receiverId} not connected`);
    }
  }

  // Khi có sự kiện kết nối từ client, bạn có thể gửi dữ liệu tới user.
  @SubscribeMessage('join')
  handleJoinRoom(@MessageBody() userId: string, @ConnectedSocket() client: Socket): void {
    client.join(userId);  // Cho phép client tham gia vào room theo userId
    this.clients[userId] = client;  // Lưu client vào danh sách
    console.log(`${userId} has joined the room`);
  }
}
