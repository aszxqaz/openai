import {
  Account as AccountModel,
  Model as ModelModel,
  User as UserModel,
  UserRole,
} from '@prisma/client';
import {
  ApiPropertyAccountAvailableCredits,
  ApiPropertyModelCreditsPerToken,
  ApiPropertyModelID,
  ApiPropertyModelName,
  ApiPropertyUserID,
  ApiPropertyUserRole,
  ApiPropertyUserUsername,
} from 'src/common/swagger/properties';

export class User implements UserModel {
  @ApiPropertyUserID()
  id: number;

  @ApiPropertyUserUsername()
  username: string;

  @ApiPropertyUserRole()
  role: UserRole;
}

export class Account implements AccountModel {
  @ApiPropertyUserID()
  userId: number;

  @ApiPropertyAccountAvailableCredits()
  availableCredits: number;
}

export class Model implements ModelModel {
  @ApiPropertyModelID()
  id: number;

  @ApiPropertyModelName()
  name: string;

  @ApiPropertyModelCreditsPerToken()
  creditsPerToken: number;
}
