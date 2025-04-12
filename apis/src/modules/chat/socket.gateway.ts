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
import { InforService } from '@modules/infor/infor.service';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bull';

@WebSocketGateway(3008, { transports: ['websocket'] })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private clients: { [key: string]: Socket } = {};
  @WebSocketServer()
  server: Server

  constructor(
    private readonly chatService: ChatService,
    private readonly inforService: InforService,
    private readonly jwtService: JwtService,
    @InjectQueue('messageQueue') private readonly messageQueue: Queue
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
        console.log(`User ${userId} connected`);
        client.join(userId);

        const rooms = await this.handleGetRoom(userId)

        rooms.forEach(room => {
          client.join(room);
          console.log(`User ${userId} joined room ${room}`);
        })

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

  async handleGetRoom(userId: string): Promise<string[]> {
    const rooms = await this.inforService.getRoom(userId);
    console.log(rooms)
    return rooms
  }
  @SubscribeMessage('joinRoom')
  handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() roomId: string) {
    console.log(`📢 ${client.id} yêu cầu join room:`, roomId);
    client.join(roomId);
    console.log(`✅ Socket ${client.id} đã join room ${roomId}`);
  }

  @SubscribeMessage('sendMessage')
  async sendMessageToRoom(user, input: InputMessageDto) {
    const { roomId } = input
    const senderId = user.sub
    const payload = {
      senderId,
      ...input
    }
    // const messageQueue = this.queue.getQueue('messageQueue');
    const job = await this.messageQueue.add('sendMessageJob', payload);
    console.log('Job added to queue:', job.id);

    if (!this.server) {
      throw new InternalServerErrorException('WebSocket server is not initialized');
    }

    this.server.to(roomId).emit('newMessage', payload);
    return payload
  }

  //notifications
  @SubscribeMessage('newNotification')
  sendNotificationComment(receiverId: any, notification: any) {
    this.server.to(receiverId).emit('newNotification', notification)
  }

  @SubscribeMessage('newNotification')
  matchingNotification(from: string, to: string, notification: string) {
    this.server.to(from).emit('newNotification', notification)
    this.server.to(to).emit('newNotification', notification)
  }


  @SubscribeMessage('newComment')
  sendCommentForDocument(receiverId: any, payload: any) {
    this.server.to(receiverId).emit('newComment', payload)
  }

  @SubscribeMessage('newMatchingRequestNotification')
    sendMatchingRequestNotification(to: string, notification: string) {
        this.server.to(to).emit('newMatchingRequestNotification', notification);
    }
}
