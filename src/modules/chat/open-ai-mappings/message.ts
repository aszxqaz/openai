import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

enum Role {
  User = 'user',
  System = 'system',
}

export class Message {
  @ApiProperty({
    enum: ['user', 'system'],
    description: 'The role of the author of a message',
    example: 'user',
    required: true,
  })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({
    type: 'string',
    description: 'The content of the message',
    example: 'What is the weather like today?',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
