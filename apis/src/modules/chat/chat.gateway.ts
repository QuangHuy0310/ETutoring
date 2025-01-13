import { WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, MessageBody, WsResponse, ConnectedSocket } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-message.dto';

@WebSocketGateway(3001, { transports: ['websocket'] })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private clients: { [key: string]: Socket } = {};

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,  // Inject JwtService
  ) {}

  // Khi người dùng kết nối vào WebSocket
  async handleConnection(client: Socket) {
    const token = client.handshake.query.token as string;

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      // Xác thực token
      const decodedToken = this.jwtService.verify(token);  // Giải mã token
      const userId = decodedToken.sub;  // Lấy userId từ payload

      if (userId) {
        this.clients[userId] = client; // Lưu client theo userId
        client.join(userId);  // Người dùng tham gia phòng với userId
        console.log(`${userId} has joined the room`);
      } else {
        throw new UnauthorizedException('Invalid token');
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  // Khi người dùng ngắt kết nối
  handleDisconnect(client: Socket) {
    const userId = Object.keys(this.clients).find(key => this.clients[key] === client);
    if (userId) {
      delete this.clients[userId];  // Xóa client khỏi danh sách
      console.log(`${userId} has disconnected`);
    }
  }

  // Lắng nghe sự kiện `sendMessage` và gửi tin nhắn tới người nhận
  @SubscribeMessage('sendMessage')
  async handleMessage(@MessageBody() createChatDto: CreateChatDto, @ConnectedSocket() client: Socket): Promise<WsResponse<any>> {
    const token = client.handshake.query.token as string;

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      // Xác thực token
      const decodedToken = this.jwtService.verify(token);  // Giải mã token
      const userId = decodedToken.sub;

      if (userId) {
        // Đảm bảo senderId đã được gán
        createChatDto.senderId = userId;
        console.log('Received message:', createChatDto);

        // Lưu tin nhắn vào database
        const savedMessage = await this.chatService.create(createChatDto);

        // Gửi tin nhắn tới người nhận
        this.sendMessageToReceiver(createChatDto.receiverId, savedMessage);

        return { event: 'receiveMessage', data: savedMessage };
      } else {
        throw new UnauthorizedException('Invalid token');
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  // Gửi tin nhắn tới người nhận
  sendMessageToReceiver(receiverId: string, message: any): void {
    const receiverClient = this.clients[receiverId];
    if (receiverClient) {
      console.log(`Sending message to receiver ${receiverId}:`, message);
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
