export type CreateChatCompletionOptions = {
  messages: {
    role: 'user' | 'system';
    content: string;
  }[];
  model: string;
};

export type CreateChatCompletionArgs = CreateChatCompletionOptions;

export type CreateChatCompletionStreamArgs = {
  options: CreateChatCompletionOptions;
  onAbort?: (abortFn: () => void) => void;
};
