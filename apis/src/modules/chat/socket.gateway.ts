import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { InputMessageDto } from './dto/create-message.dto';
import { InforService } from '@modules/infor/infor.service';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bull';

@WebSocketGateway({
  transports: ['websocket'],
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private clients: { [key: string]: Socket } = {};
  private ownerId: string;

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly inforService: InforService,
    private readonly jwtService: JwtService,
    @InjectQueue('messageQueue') private readonly messageQueue: Queue,
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.query.token as string;

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const decodedToken = this.jwtService.verify(token);
      const userId = decodedToken.sub;

      if (userId) {
        this.ownerId = userId; // ✅ FIXED: Assign ownerId correctly
        this.clients[userId] = client;
        console.log(`User ${userId} connected`);
        client.join(userId); // optional: join to personal socket room
      } else {
        throw new UnauthorizedException('Invalid token');
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  handleDisconnect(client: Socket) {
    const userId = Object.keys(this.clients).find((key) => this.clients[key] === client);
    if (userId) {
      delete this.clients[userId];
      console.log(`${userId} has disconnected`);
    }
  }

  async handleGetRoom(userId: string): Promise<string[]> {
    const rooms = await this.inforService.getRoom(userId);
    return rooms;
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() _roomId: string) {
    console.log(`🔐 JoinRoom event received from client: ${client.id} for user ${this.ownerId}`);

    const rooms = await this.handleGetRoom(this.ownerId);
    console.log('📦 Rooms to join:', rooms);

    rooms.forEach((room) => {
      client.join(room);
      console.log(`🟢 User ${this.ownerId} joined room ${room}`);
    });

    console.log(`📡 Client ${client.id} now in rooms:`, Array.from(client.rooms));
  }

  @SubscribeMessage('sendMessage')
  async sendMessageToRoom(user, input: InputMessageDto) {
    const { roomId } = input;
    const senderId = user.sub;
    const payload = {
      senderId,
      ...input,
    };

    const job = await this.messageQueue.add('sendMessageJob', payload);
    console.log('📨 Job added to queue:', job.id);
    console.log('🚀 Emitting newMessage to room:', roomId);

    if (!this.server) {
      throw new InternalServerErrorException('WebSocket server is not initialized');
    }

    this.server.to(roomId).emit('newMessage', payload);
    return payload;
  }

  @SubscribeMessage('newNotification')
  sendNotificationComment(receiverId: any, notification: any) {
    this.server.to(receiverId).emit('newNotification', notification);
  }

  @SubscribeMessage('newNotification')
  matchingNotification(from: string, to: string, notification: string) {
    this.server.to(from).emit('newNotification', notification);
    this.server.to(to).emit('newNotification', notification);
  }

  @SubscribeMessage('newComment')
  sendCommentForDocument(receiverId: any, payload: any) {
    this.server.to(receiverId).emit('newComment', payload);
  }

  @SubscribeMessage('newMatchingRequestNotification')
  sendMatchingRequestNotification(to: string, notification: string) {
    this.server.to(to).emit('newMatchingRequestNotification', notification);
  }
}
