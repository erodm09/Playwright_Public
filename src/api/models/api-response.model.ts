/**
 * Generic wrapper types for API responses.
 *
 * Using a discriminated union (`ApiResult`) means callers are forced by the
 * type system to handle both success and failure paths — eliminating an
 * entire class of runtime errors.
 */

export interface ApiSuccess<T> {
  ok: true;
  status: number;
  data: T;
  headers: Record<string, string>;
}

export interface ApiFailure {
  ok: false;
  status: number;
  error: string;
  headers: Record<string, string>;
}

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

/** JSONPlaceholder Post model */
export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

/** JSONPlaceholder CreatePost request */
export interface CreatePostRequest {
  title: string;
  body: string;
  userId: number;
}
