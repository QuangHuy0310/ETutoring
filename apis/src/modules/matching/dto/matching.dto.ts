import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

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