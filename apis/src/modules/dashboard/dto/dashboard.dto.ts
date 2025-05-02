import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsOptional, IsString } from "class-validator";

export class FilterTimeDto{
    @ApiPropertyOptional()
    @IsOptional()
    month: number;

    @ApiPropertyOptional()
    @IsOptional()
    year: number;
}

export class FilterChartDto{
    @ApiProperty()
    @IsArray()
    roomIds: string[];

    @ApiProperty()
    @IsString()
    senderId: string;

    @ApiProperty()
    @IsArray()
    relatedIds: string[];

    @ApiPropertyOptional()
    @IsOptional()
    month: string;

    @ApiPropertyOptional()
    @IsOptional()
    year: string;
}