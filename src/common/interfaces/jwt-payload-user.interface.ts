import { Role } from '@prisma/client';

export interface JwtPayloadUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
}
