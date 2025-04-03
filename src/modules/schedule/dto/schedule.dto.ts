import { ApiHideProperty, ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsDate, IsNumber, IsOptional, IsString, Matches } from "class-validator";

export class InputScheduleDto {
    @ApiProperty()
    @IsString()
    userId: string;

    @ApiProperty()
    @IsString()
    @Matches(/^\d{1,2}\/\d{1,2}\/\d{4}$/)
    days: string;

    @ApiProperty()
    @IsString()
    slotId: string;

    @ApiProperty()
    @IsString()
    partnerId: string;

    @ApiProperty()
    @IsString()
    majorId: string;
}

export class CreateScheduleDto {
    @ApiProperty()
    @IsString()
    userId: string;

    @ApiProperty()
    @IsNumber()
    // @Matches(/^\d{1,2}\/\d{1,2}\/\d{4}$/)
    days: number;

    @ApiProperty()
    @IsString()
    slotId: string;

    @ApiProperty()
    @IsString()
    partnerId: string;

    @ApiProperty()
    @IsString()
    majorId: string;
}

export class QueryScheduleDto {
    @ApiProperty()
    @IsString()
    userId: string; 

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => Number(value))
    week: number;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => Number(value))
    month: number;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => Number(value))
    year: number;
}