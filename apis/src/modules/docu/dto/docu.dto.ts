import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";


export class InputCreateDto {
    @ApiPropertyOptional()
    @IsOptional()
    roomId: string;

    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsString()
    title: string;

    @ApiProperty()
    @IsString()
    path: string;
}


export class DocumentDto extends InputCreateDto {
    @ApiProperty()
    @IsString()
    userId: string;

}

export class FilterGetDocumentDto {
    @ApiPropertyOptional()
    @IsOptional()
    roomId: string;

    @ApiPropertyOptional()
    @IsOptional()
    userId: string;

    @ApiPropertyOptional()
    @IsOptional()
    createdAt: string;

    @ApiPropertyOptional()
    @IsOptional()
    name: string; 

}

export class UpdateCommentDto{
    @ApiProperty()
    @IsString()
    id: string;

    @ApiProperty()
    @IsString()
    comment: string;
}

