import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class UserIdParam {
  @ApiProperty({
    name: 'userId',
    type: Number,
    description: 'User ID',
  })
  @IsPositive()
  @IsNumber({ allowNaN: false })
  @IsNotEmpty()
  @Transform(({ value }) => {
    return Number(value);
  })
  userId: number;
}
