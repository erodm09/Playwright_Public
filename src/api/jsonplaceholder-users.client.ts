import type { APIRequestContext } from '@playwright/test';
import { BaseApiClient } from './base-api.client';
import type {
  CreateUserRequest,
  CreateUserResponse,
  JsonPlaceholderUser,
  UpdateUserResponse,
} from './models/user.model';
import type { ApiResult } from './models/api-response.model';
import { env } from '../utils/env.config';

/**
 * Typed client for https://jsonplaceholder.typicode.com/users
 *
 * JSONPlaceholder is reliable from GitHub Actions (unlike reqres.in, which
 * often returns Cloudflare 403 for datacenter IPs).
 */
export class JsonPlaceholderUsersClient extends BaseApiClient {
  constructor(request: APIRequestContext) {
    super(request, env.apiBaseUrl);
  }

  /** GET /users with pagination via `_start` and `_limit` */
  async getUsers(page = 1, perPage = 6): Promise<ApiResult<JsonPlaceholderUser[]>> {
    const start = (page - 1) * perPage;
    return this.get<JsonPlaceholderUser[]>('/users', { _start: start, _limit: perPage });
  }

  async getUserById(id: number): Promise<ApiResult<JsonPlaceholderUser>> {
    return this.get<JsonPlaceholderUser>(`/users/${id}`);
  }

  async createUser(payload: CreateUserRequest): Promise<ApiResult<CreateUserResponse>> {
    const username = payload.job
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .slice(0, 24) || 'user';
    return this.post<CreateUserResponse>('/users', {
      name: payload.name,
      username,
      email: payload.email,
    });
  }

  async updateUser(id: number, payload: CreateUserRequest): Promise<ApiResult<UpdateUserResponse>> {
    const username = payload.job
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .slice(0, 24) || 'user';
    return this.put<UpdateUserResponse>(`/users/${id}`, {
      name: payload.name,
      username,
      email: payload.email,
    });
  }

  async deleteUser(id: number): Promise<ApiResult<void>> {
    return this.delete<void>(`/users/${id}`);
  }
}
