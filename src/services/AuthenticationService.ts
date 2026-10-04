import { User } from '../models/User';
import { requestJson } from './apiClient';

interface UserResponse {
  user: { id: string; email: string } | null;
}

export interface Credentials {
  email: string;
  password: string;
}

export class AuthenticationService {
  async register(credentials: Credentials & { confirmPassword: string }): Promise<User> {
    const { user } = await requestJson<UserResponse>('/api/auth/register', {
      method: 'POST',
      body: credentials,
    });
    return this.toUser(user);
  }

  async login(credentials: Credentials): Promise<User> {
    const { user } = await requestJson<UserResponse>('/api/auth/login', {
      method: 'POST',
      body: credentials,
    });
    return this.toUser(user);
  }

  async logout(): Promise<void> {
    await requestJson('/api/auth/logout', { method: 'POST' });
  }

  async getSession(): Promise<User | null> {
    const { user } = await requestJson<UserResponse>('/api/auth/session');
    return user ? new User(user.id, user.email) : null;
  }

  private toUser(user: UserResponse['user']): User {
    if (!user) throw new Error('INVALID_RESPONSE');
    return new User(user.id, user.email);
  }
}
