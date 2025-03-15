import { ApiHideProperty, ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateBlogDTO {
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
    tags: string[] | null;
}

export class GetBlogDto {
    @ApiProperty()
    @IsNumber()
    @Type(() => Number)
    page: number = 1;

    @ApiProperty()
    @Type(() => Number)
    @IsNumber()
    limit: number = 10;

    @ApiPropertyOptional({ type: [String] }) 
    @IsOptional()
    @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
    tags: string[] | null;

    @ApiProperty()
    @IsOptional()
    caption: string;

    @ApiProperty()
    @IsOptional()
    status: string;
}


export class updateStatusBlog {
    @ApiProperty()
    @IsString()
    id: string

    @ApiProperty()
    @IsString()
    status: string
}