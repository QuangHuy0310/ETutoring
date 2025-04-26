import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum } from 'class-validator';

export class CreateMatchingRequestDto {
    @ApiProperty()
    @IsString()
    studentId: string;

    @ApiProperty()
    @IsString()
    tutorId: string;
}

export class UpdateMatchingRequestStatusDto {
    @ApiProperty({
        enum: ['pending', 'accepted', 'rejected'],
        description: 'Status of the matching request',
    })
    @IsEnum(['pending', 'accepted', 'rejected'])
    status: string;
}

export class MatchingRequestResponseDto {
    @ApiProperty()
    _id: string;

    @ApiProperty()
    studentId: string;

    @ApiProperty()
    tutorId: string;

    @ApiProperty()
    status: string;

    @ApiProperty()
    staffId?: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}