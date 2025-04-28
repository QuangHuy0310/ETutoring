import { Module } from '@nestjs/common';
import { MatchingRequestController } from './matchingRequest.controller';
import { MatchingRequestService } from './matchingRequest.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MatchingRequest, MatchingRequestSchema } from '@entities/matchingRequest.entities';
import { Matching, MatchingSchema } from '@entities/matching.entities';
import { NotificationModule } from '@modules/notification/notification.module';
import { UserModule } from '@modules/user/user.module';
import { MatchingModule } from '@modules/matching/matching.module';
import { RoomModule } from '@modules/room/room.module'; // Thêm import RoomModule
import { ChatModule } from '@modules/chat/chat.module';
import { SocketGateway } from '@modules/chat/socket.gateway';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: MatchingRequest.name, schema: MatchingRequestSchema },
            { name: Matching.name, schema: MatchingSchema },
        ]),
        NotificationModule,
        UserModule,
        MatchingModule,
        RoomModule, 
        ChatModule,
    ],
    controllers: [MatchingRequestController],
    providers: [MatchingRequestService],
    exports: [MatchingRequestService],
})
export class MatchingRequestModule {}