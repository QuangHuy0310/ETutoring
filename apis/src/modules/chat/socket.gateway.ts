import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  WsResponse,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { CreateChatDto, InputMessageDto } from './dto/create-message.dto';
import { JoinRoomDto } from './dto/socket.dto';

@WebSocketGateway(3008, { transports: ['websocket'] })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private clients: { [key: string]: Socket } = {};
  @WebSocketServer()
  server: Server

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) { }



  // Khi người dùng kết nối
  async handleConnection(client: Socket) {
    const token = client.handshake.query.token as string;

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const decodedToken = this.jwtService.verify(token); // Giải mã token
      const userId = decodedToken.sub; // Lấy userId từ payload

      if (userId) {
        this.clients[userId] = client;
        console.log(`${userId} has joined`);
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
    const userId = Object.keys(this.clients).find((key) => this.clients[key] === client);
    if (userId) {
      delete this.clients[userId]; // Xóa client khỏi danh sách
      console.log(`${userId} has disconnected`);
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(@MessageBody() data: JoinRoomDto, @ConnectedSocket() client: Socket) {
    client.join(data.roomId);
    console.log(`✅ User ${client.id} joined room ${data.roomId}`);
  }

  @SubscribeMessage('sendMessage')
  async sendMessageToRoom(user, input: InputMessageDto) {
    const { roomId } = input
    const senderId = user.sub
    const payload = {
      senderId,
      ...input
    }
    const newMessage = await this.chatService.createMessage(payload);

    if (!this.server) {
      throw new InternalServerErrorException('WebSocket server is not initialized');
    }

    this.server.to(roomId).emit('newMessage', newMessage);
  }

  //notifications
  sendNotification(receiverId: any, notification: any) {
    console.log('Receiver ID:', receiverId);  // Kiểm tra receiverId

    const receiverClient = this.clients[receiverId];

    if (receiverClient) {
      receiverClient.emit('newCommentNotification', notification);
    } else {
      console.warn(`No active socket connection for receiverId: ${receiverId}`);
    }
  }
}
