/* eslint-disable prettier/prettier */
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { USER_ROLE } from '@utils/data-types/enums';
import { Transform } from 'class-transformer';
import { IsEmail, IsEmpty, IsEnum, IsOptional, IsString, Matches } from 'class-validator';
export class RegisterDto {
  @ApiProperty({
    example: 'nt.binh@tego.global',
  })
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @Matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/)
  password?: string;

   @ApiProperty({
    example: USER_ROLE.ADMIN,
    enum: USER_ROLE,
  })
  @IsOptional()
  @IsEnum(USER_ROLE)
  @Transform(({ value }) => value || USER_ROLE.USER) // Setting default value to "user"
  role?: USER_ROLE = USER_ROLE.USER;
}

export class LoginDto extends OmitType(RegisterDto, ['role']) {}
