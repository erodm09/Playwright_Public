import type { APIRequestContext } from '@playwright/test';
import { BaseApiClient } from './base-api.client';
import type {
  CreateUserRequest,
  CreateUserResponse,
  SingleUserResponse,
  UpdateUserResponse,
  UsersListResponse,
} from './models/user.model';
import type { ApiResult } from './models/api-response.model';
import { env } from '../utils/env.config';

/**
 * ReqresClient — typed API client for https://reqres.in
 *
 * reqres.in is a free, hosted REST API that mirrors real-world CRUD patterns.
 * It is ideal as a test target because it is:
 *  - Stable and publicly accessible
 *  - Stateless (no side effects from POST/PUT/DELETE)
 *  - Returns realistic data structures
 *
 * Each method maps 1:1 to a documented endpoint and returns a typed ApiResult.
 */
export class ReqresClient extends BaseApiClient {
  constructor(request: APIRequestContext) {
    super(request, env.apiBaseUrl);
  }

  // ------------------------------------------------------------------ //
  //  Users resource                                                      //
  // ------------------------------------------------------------------ //

  /** GET /api/users?page=N — retrieve a page of users */
  async getUsers(page = 1): Promise<ApiResult<UsersListResponse>> {
    return this.get<UsersListResponse>('/api/users', { page });
  }

  /** GET /api/users/:id — retrieve a single user */
  async getUserById(id: number): Promise<ApiResult<SingleUserResponse>> {
    return this.get<SingleUserResponse>(`/api/users/${id}`);
  }

  /** POST /api/users — create a new user */
  async createUser(payload: CreateUserRequest): Promise<ApiResult<CreateUserResponse>> {
    return this.post<CreateUserResponse>('/api/users', payload);
  }

  /** PUT /api/users/:id — full update */
  async updateUser(id: number, payload: CreateUserRequest): Promise<ApiResult<UpdateUserResponse>> {
    return this.put<UpdateUserResponse>(`/api/users/${id}`, payload);
  }

  /** PATCH /api/users/:id — partial update */
  async patchUser(id: number, payload: Partial<CreateUserRequest>): Promise<ApiResult<UpdateUserResponse>> {
    return this.patch<UpdateUserResponse>(`/api/users/${id}`, payload);
  }

  /** DELETE /api/users/:id — returns 204 No Content on success */
  async deleteUser(id: number): Promise<ApiResult<void>> {
    return this.delete<void>(`/api/users/${id}`);
  }
}
