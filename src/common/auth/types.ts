import { User, UserRole } from '@prisma/client';

export type RequestWithUser = Request & {
  user: Requestor;
};

export type AuthTokenPayload = {
  userId: number;
};

export class Requestor {
  constructor(
    public readonly id: number,
    public readonly role: UserRole,
    public readonly username: string,
  ) {}

  toUser(): User {
    return {
      id: this.id,
      role: this.role,
      username: this.username,
    };
  }

  static fromUser(user: User): Requestor {
    return new Requestor(user.id, user.role, user.username);
  }
}
