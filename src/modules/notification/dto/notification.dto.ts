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
    title: string;

    @ApiProperty()
    @IsOptional()
    status: string;
}

export class NotificationMatchingDto {
    @ApiProperty()
    @IsString()
    notificationFrom: string;

    @ApiProperty()
    @IsString()
    notificationTo: string;
}