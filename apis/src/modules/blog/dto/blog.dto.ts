import { ApiHideProperty, ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateBlogDTO{
    @ApiHideProperty()
    @IsOptional()
    userId: string;

    @ApiProperty()
    @IsString()
    caption: string;

    @ApiProperty()
    @IsArray()
    path: string[];

    @ApiProperty()
    @IsArray()
    tags: string[]| null;
}

export class GetBlogDto{
    @ApiProperty()
    @IsNumber()
    @Type(() => Number)
    page: number = 1;

    @ApiProperty()
    @Type(() => Number)
    @IsNumber()
    limit: number = 10;

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    tags: string[]| null;

    @ApiProperty()
    @IsOptional()
    caption: string


}