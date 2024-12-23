import { ApiProperty } from '@nestjs/swagger';
import { ApiPropertyModelName } from 'src/common/swagger';
import { Message } from './message';

export class CreateCompletionData {
  @ApiProperty({
    description: 'A list of messages comprising the conversation so far',
    example: [{ role: 'user', content: 'Say this is a test' }],
    type: [Message],
  })
  messages: Message[];

  @ApiPropertyModelName()
  model: string;
}
