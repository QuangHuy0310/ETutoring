import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, Matches } from 'class-validator';
import { USER_ROLE } from '@utils/data-types/enums';

export class CreateNewUserDto {
  email: string;
  hash: string;
  role: string;
}

export class UpdateUserDto {
  @ApiProperty({ description: 'The email of the user', example: 'newemail@example.com' })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsOptional()
  email: string;

  @ApiProperty({ description: 'The role of the user', enum: USER_ROLE, example: 'ADMIN' })
  @IsEnum(USER_ROLE, { message: 'Invalid role' })
  @IsOptional()
  role: USER_ROLE;

  @ApiProperty({ description: 'The new password of the user', example: 'NewPass123!' })
  @IsString()
  @IsOptional()
  @Matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/, {
    message: 'Password must be at least 8 characters long and contain at least one number and one special character',
  })
  password?: string;
}