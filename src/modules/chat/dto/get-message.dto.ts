import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsOptional, IsString } from "class-validator";

export class GetMessageDto {
    @ApiPropertyOptional({ description: 'ID của phòng chat' })
    @IsOptional()
    roomId: string;

    @ApiPropertyOptional({ description: 'ID của người gửi' })
    @IsOptional()
    senderId: string;

    @ApiPropertyOptional({ description: 'Hình ảnhảnh' })
    @IsOptional()
    path: string;

    @ApiPropertyOptional({ description: 'Tài LiệuLiệu' })
    @IsOptional()
    document: string;

    @ApiPropertyOptional({ description: 'Ngày Gửi' })
    @IsOptional()
    createdAt: string;

    @ApiPropertyOptional({ description: 'Số lượng tin nhắn tối đa trả về' })
    @IsOptional()
    limit : number = 20
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
    startDate : Date;

    @ApiPropertyOptional()
    @IsOptional()
    endDate: Date;
}
