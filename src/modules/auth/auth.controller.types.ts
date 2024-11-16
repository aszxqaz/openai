import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import {
  ApiPropertyToken,
  ApiPropertyUserPassword,
  ApiPropertyUserUsername,
  User as UserSchema,
} from 'src/common/swagger';

class UsernamePasswordSchema {
  @ApiPropertyUserUsername()
  @MaxLength(20)
  @MinLength(3)
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiPropertyUserPassword()
  @MinLength(6)
  @MaxLength(64)
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RegisterRequestBody extends UsernamePasswordSchema {}

export type RegisterResponse = void;

export class LoginRequestBody extends UsernamePasswordSchema {}

export class LoginResponse {
  @ApiProperty({ type: UserSchema })
  user: UserSchema;

  @ApiPropertyToken()
  token: string;
}

export class MeResponse extends UserSchema {}
