import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateChatDto {
    @ApiProperty()
    @IsString()
    roomId: string;

    @ApiProperty()
    @IsString()
    senderId: any;

    @ApiProperty()
    @IsString()
    message: string;
}

export class InputMessageDto {
    @ApiProperty()
    @IsString()
    roomId: string;

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
