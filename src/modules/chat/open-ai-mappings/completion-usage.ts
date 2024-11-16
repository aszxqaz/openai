import { ApiProperty } from '@nestjs/swagger';
import { CompletionUsage as OpenAICompletionUsage } from 'openai/resources';

export class CompletionUsage {
  @ApiProperty({
    type: 'integer',
    description: 'Number of tokens in the generated completion',
    example: 100,
  })
  public readonly completionTokens: number;

  @ApiProperty({
    type: 'integer',
    description: 'Number of tokens in the prompt',
    example: 100,
  })
  public readonly promptTokens: number;

  @ApiProperty({
    type: 'integer',
    description:
      'Total number of tokens used in the request (prompt + completion)',
    example: 200,
  })
  public readonly totalTokens: number;

  constructor(
    completionTokens: number,
    promptTokens: number,
    totalTokens: number,
  ) {
    this.completionTokens = completionTokens;
    this.promptTokens = promptTokens;
    this.totalTokens = totalTokens;
  }

  static fromOpenAI(usage: OpenAICompletionUsage) {
    return new CompletionUsage(
      usage.completion_tokens,
      usage.prompt_tokens,
      usage.total_tokens,
    );
  }
}
