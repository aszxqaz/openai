import { Account } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber, IsPositive, Min } from 'class-validator';
import { ApiPropertyRequiredPositiveInt } from 'src/common/swagger/properties';

export class AmountQuery {
  @IsPositive()
  @Min(1)
  @IsInt()
  @IsNumber({ allowNaN: false })
  @IsNotEmpty()
  @Transform(({ value }) => {
    return Number(value);
  })
  amount: number;
}

export class CreditQuery extends AmountQuery {
  @ApiPropertyRequiredPositiveInt('Amount to credit the account with')
  amount: number;
}

export type DebitResponse = Account;

export class DebitQuery extends AmountQuery {
  @ApiPropertyRequiredPositiveInt('Amount to debit the account with')
  amount: number;
}

export type CreditResponse = Account;
