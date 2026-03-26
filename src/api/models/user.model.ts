/**
 * Domain models for the JSONPlaceholder `/users` API.
 *
 * https://jsonplaceholder.typicode.com is used instead of reqres.in because
 * reqres is often blocked by Cloudflare in CI environments (403), while
 * JSONPlaceholder remains reliably accessible for automated tests.
 */

/** User object returned by GET /users and GET /users/:id */
export interface JsonPlaceholderUser {
  id: number;
  name: string;
  username: string;
  email: string;
  phone?: string;
  website?: string;
}

/** POST /users — request body (mirrors our factory; client maps to JSONPlaceholder shape) */
export interface CreateUserRequest {
  name: string;
  job: string;
  email: string;
}

/** POST /users — JSONPlaceholder echoes the payload and assigns a synthetic id */
export interface CreateUserResponse {
  id: number;
  name: string;
  username: string;
  email: string;
}

/** PUT /users/:id — response body */
export interface UpdateUserResponse {
  id: number;
  name: string;
  username: string;
  email: string;
}
