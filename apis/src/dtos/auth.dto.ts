/* eslint-disable prettier/prettier */
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { USER_ROLE } from '@utils/data-types/enums';
import { IsEmail, IsEmpty, IsEnum, IsString, Matches } from 'class-validator';
export class RegisterDto {
  @ApiProperty({
    example: 'nt.binh@tego.global',
  })
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @Matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/)
  password: string;

  /* @ApiProperty({
    example: USER_ROLE.ADMIN,
    enum: USER_ROLE,
  })
  @IsEnum(USER_ROLE) */
  @IsEmpty()
  //role: USER_ROLE;
  role: string;
}

export class LoginDto extends OmitType(RegisterDto, ['role']) {}
