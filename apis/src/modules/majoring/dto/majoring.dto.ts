import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class MajoringDto{
    @ApiProperty()
    @IsString()
    name: string;
}

export class CreateMajoringDto {
    @ApiPropertyOptional()
    @IsOptional()
    id: string;
}