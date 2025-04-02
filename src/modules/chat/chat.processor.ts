import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { ChatService } from './chat.service';

@Processor('messageQueue')
export class MessageProcessor {
    constructor(private readonly chatService: ChatService) {
        console.log('✅ MessageProcessor đã khởi động')
    }

    @Process('sendMessageJob')
    async processMessage(job: Job) {
        const { senderId, roomId, message, path } = job.data;
        // Tạo tin nhắn và lưu vào DB
        const payload = {
            senderId,
            roomId,
            message,
            path,
        }

        console.log('queue',payload)
        return this.chatService.createMessage(payload);
    }
}
