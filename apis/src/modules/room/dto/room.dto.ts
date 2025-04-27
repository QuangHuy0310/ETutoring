import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

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

export class GetUserByRoomIdDto {
    @ApiProperty()
    @IsString()
    user1: string;

    @ApiProperty()
    @IsString()
    user2: string;
}

export class PaginationDto {
    @ApiPropertyOptional()
    @IsOptional()
    page: number = 1;

    @ApiPropertyOptional()
    @IsOptional()
    limit: number = 10;
}