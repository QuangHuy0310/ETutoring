import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class GetRoomDto{
    @ApiProperty()
    @IsString()
    id: string;
}

export class CreateRoomDto {
    @ApiProperty()
    @IsString()
    userId: string;

    @ApiProperty()
    @IsString()
    tutorId: string;
}