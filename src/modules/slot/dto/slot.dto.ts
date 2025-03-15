import { ApiHideProperty, ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsDate, IsOptional, IsString, Matches } from "class-validator";

export class CreateSlotDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty({ example: "08:00" })
    @IsString()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "timeStart phải có định dạng HH:mm" })
    timeStart: string;

    @ApiProperty({ example: "18:30" })
    @IsString()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "timeEnd phải có định dạng HH:mm" })
    timeEnd: string;

}
