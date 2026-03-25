import type { APIRequestContext, APIResponse } from '@playwright/test';
import { logger } from '../utils/logger';
import type { ApiResult } from './models/api-response.model';

/**
 * BaseApiClient — a thin, typed wrapper around Playwright's APIRequestContext.
 *
 * Why wrap instead of using APIRequestContext directly in tests?
 *  1. Centralises request/response logging so every call is traceable
 *  2. Enforces a consistent error-handling contract (ApiResult<T>)
 *  3. Lets us add auth headers, retry logic, or request signing in one place
 *  4. Tests stay readable — they express *what* to call, not *how* to call it
 */
export class BaseApiClient {
  protected readonly baseUrl: string;
  protected readonly request: APIRequestContext;

  constructor(request: APIRequestContext, baseUrl: string) {
    this.request = request;
    this.baseUrl = baseUrl.replace(/\/$/, ''); // normalise trailing slash
  }

  // ------------------------------------------------------------------ //
  //  HTTP verbs                                                          //
  // ------------------------------------------------------------------ //

  protected async get<T>(path: string, params?: Record<string, string | number>): Promise<ApiResult<T>> {
    const url = this.buildUrl(path, params);
    logger.debug(`GET ${url}`);
    const response = await this.request.get(url);
    return this.parseResponse<T>(response, 'GET', url);
  }

  protected async post<T>(path: string, body: unknown): Promise<ApiResult<T>> {
    const url = this.buildUrl(path);
    logger.debug(`POST ${url}`, { body: JSON.stringify(body) });
    const response = await this.request.post(url, { data: body });
    return this.parseResponse<T>(response, 'POST', url);
  }

  protected async put<T>(path: string, body: unknown): Promise<ApiResult<T>> {
    const url = this.buildUrl(path);
    logger.debug(`PUT ${url}`, { body: JSON.stringify(body) });
    const response = await this.request.put(url, { data: body });
    return this.parseResponse<T>(response, 'PUT', url);
  }

  protected async patch<T>(path: string, body: unknown): Promise<ApiResult<T>> {
    const url = this.buildUrl(path);
    logger.debug(`PATCH ${url}`, { body: JSON.stringify(body) });
    const response = await this.request.patch(url, { data: body });
    return this.parseResponse<T>(response, 'PATCH', url);
  }

  protected async delete<T>(path: string): Promise<ApiResult<T>> {
    const url = this.buildUrl(path);
    logger.debug(`DELETE ${url}`);
    const response = await this.request.delete(url);
    return this.parseResponse<T>(response, 'DELETE', url);
  }

  // ------------------------------------------------------------------ //
  //  Internal helpers                                                    //
  // ------------------------------------------------------------------ //

  private buildUrl(path: string, params?: Record<string, string | number>): string {
    const base = `${this.baseUrl}/${path.replace(/^\//, '')}`;
    if (!params || Object.keys(params).length === 0) {
      return base;
    }
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
    ).toString();
    return `${base}?${query}`;
  }

  private async parseResponse<T>(
    response: APIResponse,
    method: string,
    url: string,
  ): Promise<ApiResult<T>> {
    const headers = response.headers() as Record<string, string>;
    const status = response.status();

    logger.debug(`${method} ${url} → ${status}`);

    if (!response.ok()) {
      const error = await response.text().catch(() => 'Unable to parse error body');
      logger.warn(`${method} ${url} failed`, { status, error });
      return { ok: false, status, error, headers };
    }

    // Handle 204 No Content — valid success with no body
    if (status === 204) {
      return { ok: true, status, data: undefined as unknown as T, headers };
    }

    const data = await response.json() as T;
    return { ok: true, status, data, headers };
  }
}
