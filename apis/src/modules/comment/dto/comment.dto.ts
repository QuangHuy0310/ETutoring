import { ApiHideProperty, ApiProperty } from "@nestjs/swagger";
import { IsArray, IsOptional, IsString } from "class-validator";

export class CreateCommentDto {
    @ApiHideProperty()
    @IsOptional()
    userId: string;

    @ApiProperty()
    @IsString()
    blogId: string;

    @IsOptional()
    @ApiProperty()
    @IsString()
    comment: string;

    @IsOptional()
    @ApiProperty()
    @IsArray()
    path: string[];
}

export class BodyCommentDto{
    @ApiHideProperty()
    @IsOptional()
    userId: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    comment: string;

    @ApiProperty()
    @IsArray()
    @IsOptional()
    path: string[];
}