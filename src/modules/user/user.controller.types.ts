import { UserRole } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { capitalizeLowerCased } from 'src/common/helpers';
import { ApiPropertyUserRole } from 'src/common/swagger';

export class UpdateSecureUserQuery {
  @ApiPropertyUserRole()
  @Transform(({ value }) => capitalizeLowerCased('' + value))
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;
}
