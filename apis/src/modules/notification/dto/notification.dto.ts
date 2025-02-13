import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class NotificationDto {
    @ApiProperty()
    @IsString()
    notificationFrom: string;

    @ApiProperty()
    @IsString()
    notificationTo: string;

    @ApiProperty()
    @IsString()
    blogId: string;

    @ApiProperty()
    @IsOptional()
    status: string;
}