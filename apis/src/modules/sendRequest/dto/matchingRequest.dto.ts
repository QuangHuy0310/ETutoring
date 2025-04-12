import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateMatchingRequestDto {
    @ApiProperty()
    @IsString()
    studentId: string;

    @ApiProperty()
    @IsString()
    tutorId: string;
}