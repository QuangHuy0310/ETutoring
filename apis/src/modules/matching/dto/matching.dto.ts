import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsOptional, IsString } from "class-validator";

export class CreateMatchingDto {
    @ApiProperty()
    @IsString()
    studentId: string;

    @ApiProperty()
    @IsString()
    tutorId: string;

    @ApiPropertyOptional({default: 'on'})
    @IsOptional()
    status: string;
}

export class CreateBulkMatchingDto {
    @ApiProperty({ type: [String] })
    @IsArray()
    @IsString({ each: true })
    studentIds: string[];

    @ApiProperty()
    @IsString()
    tutorId: string;

    @ApiProperty()
    @IsString()
    status: string;
}

export class GetUserByRoomIdDto {
    @ApiProperty()
    @IsString()
    roomId: string;

    @ApiProperty()
    @IsString()
    userId: string;

    @ApiProperty()
    @IsString()
    tutorId: string;
}