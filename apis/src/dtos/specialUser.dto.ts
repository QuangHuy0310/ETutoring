import { USER_ROLE } from "@utils/data-types/enums";
import { IsEmail, IsEnum } from "class-validator";

export class SpecialUserDto {
    @IsEmail()
    email: string;

    @IsEnum(USER_ROLE)
    role: USER_ROLE;
}