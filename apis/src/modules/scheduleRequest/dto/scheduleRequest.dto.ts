import { ApiHideProperty, ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, Matches } from "class-validator";

export class ScheduleRequestUpdateDto {
    @ApiProperty()
    @IsString()
    id: string;

    @ApiProperty({ enum: ['accepted', 'rejected'], default: 'pending' })
    @IsString()
    status: string;
}

export class ScheduleRequestDto {
    @ApiHideProperty()
    @IsOptional()
    senderId: string;

    @ApiProperty()
    @IsString()
    reciverId: string;

    @ApiProperty({default: 'pending'})
    @IsOptional()
    status: string;

    @ApiProperty()
    @IsString()
    @Matches(/^\d{1,2}\/\d{1,2}\/\d{4}$/)
    days: string;

    @ApiProperty()
    @IsString()
    slotId: string;
}

export class ScheduleRequestNotiDto {
    @ApiProperty()
    @IsString()
    id: string;

    @ApiProperty()
    @IsString()
    status: string;
}

export class InputScheduleDto {

    @ApiProperty()
    @IsString()
    @Matches(/^\d{1,2}\/\d{1,2}\/\d{4}$/)
    days: string;

    @ApiProperty()
    @IsString()
    slotId: string;

    @ApiProperty()
    @IsString()
    reciverId: string;

}