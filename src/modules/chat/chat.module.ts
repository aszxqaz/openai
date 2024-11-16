import { Module } from '@nestjs/common';
import { OpenAIModule } from 'src/modules/openai';
import { ChatController, ChatService } from '.';

@Module({
  imports: [OpenAIModule],
  providers: [ChatService],
  controllers: [ChatController],
  exports: [],
})
export class ChatModule {}
