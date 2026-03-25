/**
 * Domain models for the reqres.in User resource.
 *
 * Defining explicit TypeScript interfaces (rather than using `any`) gives us:
 *  - Compile-time safety when accessing response fields
 *  - Auto-complete in the editor
 *  - Self-documenting contracts that act as living API documentation
 */

export interface UserData {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
}

export interface Support {
  url: string;
  text: string;
}

/** Single-user GET response: GET /api/users/:id */
export interface SingleUserResponse {
  data: UserData;
  support: Support;
}

/** Paginated list response: GET /api/users?page=N */
export interface UsersListResponse {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: UserData[];
  support: Support;
}

/** POST /api/users — request body */
export interface CreateUserRequest {
  name: string;
  job: string;
}

/** POST /api/users — response body */
export interface CreateUserResponse {
  name: string;
  job: string;
  id: string;
  createdAt: string;
}

/** PUT/PATCH /api/users/:id — response body */
export interface UpdateUserResponse {
  name: string;
  job: string;
  updatedAt: string;
}
