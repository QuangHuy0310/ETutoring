import { ApiHideProperty, ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsEmail, IsNumber, IsOptional, IsString, Validate, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";


@ValidatorConstraint({ name: 'IsFlexiblePhoneNumber', async: false })
export class IsFlexiblePhoneNumber implements ValidatorConstraintInterface {
    validate(phone: string) {
        const internationalRegex = /^\+?[1-9]\d{1,14}$/; // E.164
        const localRegex = /^0\d{9}$/;
        return internationalRegex.test(phone) || localRegex.test(phone);
    }

    defaultMessage() {
        return 'phone must be a valid phone number';
    }
}


export class CreateInforDto {
    @ApiHideProperty()
    @IsOptional()
    userId: string;

    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsString()
    path: string;

    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @Validate(IsFlexiblePhoneNumber)
    phone?: string;

    @ApiProperty()
    @IsString()
    address: string;

    @ApiProperty()
    @IsString()
    major: string;

    @ApiProperty()
    @IsString()
    country: string;

}

export class GetInforDto {
    @ApiProperty()
    @IsNumber()
    page: number;

    @ApiProperty()
    @IsNumber()
    limit: number;

    @ApiProperty({ default: false })
    @IsBoolean()
    role: boolean = false;
}

export class pushInforDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    tutorId: string[] | null;
}

export class MatchingForStaff {
    @ApiProperty()
    @IsString()
    userId: string;

    @ApiProperty()
    @IsString()
    tutorId: string;
}

export class FilterInformationDto {
    @ApiPropertyOptional()
    @IsOptional()
    name: string;

    @ApiPropertyOptional()
    @IsOptional()
    major: string;

    @ApiPropertyOptional()
    @IsOptional()
    country: string;

}
