import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class GetMessageDto {
    @ApiPropertyOptional({ description: 'ID của phòng chat' })
    @IsOptional()
    roomId: string;

    @ApiPropertyOptional()
    @IsOptional()
    limit : number 
}