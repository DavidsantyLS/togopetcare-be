import { User } from '../entities/user.entity';

export interface LoginResponse {
  message?: string;
  token: string;
  user: User;
}
