import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString } from "class-validator";

export class CreateConfirmDto {
    @ApiProperty()
    @IsString()
    studentId: string;

    @ApiProperty()
    @IsString()
    tutorId: string;
}

export class ConfirmStudentDto {
    @ApiProperty()
    @IsBoolean()
    studentId: boolean;
}

export class ConfirmTutorDto {
    @ApiProperty()
    @IsBoolean()
    studentId: boolean;
}