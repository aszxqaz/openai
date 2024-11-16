import { ApiProperty } from '@nestjs/swagger';
import {
  MODEL_CREDITS_PER_TOKEN_MAX,
  MODEL_CREDITS_PER_TOKEN_MIN,
  MODEL_NAME_MAX_LEN,
  MODEL_NAME_MIN_LEN,
  USER_PASSWORD_MAX_LEN,
  USER_PASSWORD_MIN_LEN,
  USER_USERNAME_MAX_LEN,
  USER_USERNAME_MIN_LEN,
} from '../constants';

export const ApiPropertyUserUsername = () =>
  ApiProperty({
    type: String,
    description: 'User username',
    minLength: USER_USERNAME_MIN_LEN,
    maxLength: USER_USERNAME_MAX_LEN,
    example: 'Peterson',
  });

export const ApiPropertyUserPassword = () =>
  ApiProperty({
    type: String,
    description: 'User password',
    minLength: USER_PASSWORD_MIN_LEN,
    maxLength: USER_PASSWORD_MAX_LEN,
    example: '0v3rfl0w',
  });

export const ApiPropertyUserID = () =>
  ApiProperty({
    type: 'integer',
    description: 'User ID',
    minimum: 1,
    example: 1,
  });

export const ApiPropertyToken = () =>
  ApiProperty({
    type: String,
    description: 'Bearer token',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImlhdCI6MTczMTUzNzE3NywiZXhwIjoxNzMxNjIzNTc3fQ.8AhKDbopJXKLgwXdJHzSAfACSwJeEy-s-Yc1dO1f6VE',
  });

export const ApiPropertyUserRole = () =>
  ApiProperty({
    enum: ['Admin', 'User'],
    description: 'Role of a user',
    example: 'Admin',
  });

export const ApiPropertyModelID = () =>
  ApiProperty({
    type: 'integer',
    description: 'Model ID',
    minimum: 1,
    example: 1,
  });

export const ApiPropertyModelName = () =>
  ApiProperty({
    type: String,
    description: 'OpenAI model name',
    minLength: MODEL_NAME_MIN_LEN,
    maxLength: MODEL_NAME_MAX_LEN,
    example: 'gpt-4o',
  });

export const ApiPropertyModelCreditsPerToken = () =>
  ApiProperty({
    type: 'integer',
    description: 'Amount of credits charged for usage of the model',
    minimum: MODEL_CREDITS_PER_TOKEN_MIN,
    maximum: MODEL_CREDITS_PER_TOKEN_MAX,
    example: 50,
  });

export const ApiPropertyAccountAvailableCredits = () =>
  ApiProperty({
    type: 'integer',
    description: 'Amount of credits available for the account',
    example: 10000,
  });

export const ApiPropertyRequiredPositiveInt = (description: string) =>
  ApiProperty({
    name: 'amount',
    type: 'integer',
    minimum: 1,
    required: true,
    description,
  });
