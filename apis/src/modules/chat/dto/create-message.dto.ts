import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateChatDto {
    @ApiProperty()
    @IsString()
    senderId: any;

    @ApiPropertyOptional()
    @IsOptional()
    receiverId: string;

    @ApiPropertyOptional()
    @IsOptional()
    groupId: string;

    @ApiProperty()
    @IsString()
    message: string;
}

export class VerifyChatDto{
    @IsString()
    senderId: string;

    @IsString()
    id: string;
}

export class SendMessageDto {
    @ApiProperty({ description: 'Nội dung tin nhắn' })
    @IsString()
    message: string;
}
