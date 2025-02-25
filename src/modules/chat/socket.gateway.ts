import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  WsResponse,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-message.dto';

@WebSocketGateway(3008, { transports: ['websocket'] })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private clients: { [key: string]: Socket } = {};

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
        this.clients[userId] = client; // Lưu client theo userId
        client.join(userId); // Người dùng tham gia phòng với userId
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

  @SubscribeMessage('sendMessage')
  async sendMessageToReceiver(senderId: any, receiverId: string, message: any): Promise<WsResponse<any>> {
    const sender = senderId.sub
    const receiverClient = this.clients[receiverId];
    if (receiverClient) {
      console.log(`Sending message to receiver ${receiverId}:`, message);
      await this.chatService.create(message);
      receiverClient.emit('receiveMessage', message);
      return { event: 'receiveMessage', data: message };
    } else {
      console.log(`Receiver with ID ${receiverId} not connected`);
    }
  }

  @SubscribeMessage('deleteMessage')
  async handleDeleteMessage(
    @MessageBody() data: { senderId: string; id: string },
  ) {
    const { senderId, id } = data;
    const senderClient = this.clients[senderId];

    await this.chatService.deleteMessage(senderId, id);
    if (senderClient) {
      senderClient.emit('messageDeleted', { id });
    }
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



  // **2. Chức năng Signaling (WebRTC)**

  @SubscribeMessage('callUser')
  async handleCallUser(
    @MessageBody()
    data: {
      caller: string;
      callee: string;
      offer: RTCSessionDescription;
      callType: 'audio' | 'video';
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { caller, callee, offer, callType } = data;

    const calleeClient = this.clients[callee];
    if (calleeClient) {
      console.log(`${caller} is calling ${callee} for a ${callType} call`);
      calleeClient.emit('incomingCall', {
        caller,
        offer,
        callType,
      });
    } else {
      console.log(`Callee with ID ${callee} is not connected`);
    }
  }

  @SubscribeMessage('answerCall')
  async handleAnswerCall(
    @MessageBody()
    data: {
      caller: string;
      callee: string;
      answer: RTCSessionDescription;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { caller, answer } = data;

    const callerClient = this.clients[caller];
    if (callerClient) {
      console.log(`${data.callee} has answered the call`);
      callerClient.emit('callAnswered', { answer });
    } else {
      console.log(`Caller with ID ${caller} is not connected`);
    }
  }

  @SubscribeMessage('rejectCall')
  async handleRejectCall(
    @MessageBody() data: { caller: string; callee: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { caller } = data;

    const callerClient = this.clients[caller];
    if (callerClient) {
      console.log(`${data.callee} has rejected the call`);
      callerClient.emit('callRejected');
    } else {
      console.log(`Caller with ID ${caller} is not connected`);
    }
  }

  @SubscribeMessage('iceCandidate')
  async handleIceCandidate(
    @MessageBody()
    data: {
      sender: string;
      receiver: string;
      candidate: RTCIceCandidate;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { receiver, candidate } = data;

    const receiverClient = this.clients[receiver];
    if (receiverClient) {
      console.log(`Sending ICE candidate to ${receiver}`);
      receiverClient.emit('iceCandidate', { candidate });
    } else {
      console.log(`Receiver with ID ${receiver} is not connected`);
    }
  }
}
