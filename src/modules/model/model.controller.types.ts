import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import {
  MODEL_CREDITS_PER_TOKEN_MAX,
  MODEL_CREDITS_PER_TOKEN_MIN,
  MODEL_NAME_MAX_LEN,
  MODEL_NAME_MIN_LEN,
} from 'src/common/constants';
import {
  ApiPropertyModelCreditsPerToken,
  ApiPropertyModelName,
} from 'src/common/swagger/properties';

export class CreateModelRequestBody {
  @ApiPropertyModelName()
  @MaxLength(MODEL_NAME_MAX_LEN)
  @MinLength(MODEL_NAME_MIN_LEN)
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyModelCreditsPerToken()
  @IsNumber()
  @Max(MODEL_CREDITS_PER_TOKEN_MAX)
  @Min(MODEL_CREDITS_PER_TOKEN_MIN)
  @IsInt()
  @IsNumber({ allowNaN: false })
  @IsNotEmpty()
  creditsPerToken: number;
}
