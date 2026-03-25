/**
 * Posts API tests — https://jsonplaceholder.typicode.com/posts
 *
 * JSONPlaceholder is a free, read/write REST API that returns predictable
 * fixture data — ideal for validating HTTP client behaviour, response
 * shape contracts, and error handling in isolation from application logic.
 *
 * This suite intentionally uses the Playwright APIRequestContext *directly*
 * (without a typed client wrapper) to demonstrate both patterns side-by-side.
 * The reqres users.spec.ts shows the wrapper pattern; this spec shows the
 * lower-level approach useful for quick exploratory tests.
 */

import { test, expect } from '../../src/fixtures';
import {
  assertHttpSuccess,
  assertNonEmptyArray,
  assertRequiredFields,
} from '../../src/helpers/custom-assertions';
import type { Post, CreatePostRequest } from '../../src/api/models/api-response.model';

const BASE = 'https://jsonplaceholder.typicode.com';

test.describe('Posts API — jsonplaceholder.typicode.com', () => {

  // ------------------------------------------------------------------ //
  //  GET /posts                                                          //
  // ------------------------------------------------------------------ //

  test.describe('GET /posts', () => {
    test('should return 100 posts @smoke', async ({ request }) => {
      const response = await request.get(`${BASE}/posts`);

      assertHttpSuccess(response.status(), 'GET /posts');
      const posts = await response.json() as Post[];

      assertNonEmptyArray(posts, 'posts');
      expect(posts).toHaveLength(100);
    });

    test('should return posts with correct shape @regression', async ({ request }) => {
      const response = await request.get(`${BASE}/posts`);
      const posts = await response.json() as Post[];
      const [first] = posts;

      assertRequiredFields(
        first as unknown as Record<string, unknown>,
        ['userId', 'id', 'title', 'body'],
      );
      expect(typeof first!.id).toBe('number');
      expect(typeof first!.title).toBe('string');
    });
  });

  // ------------------------------------------------------------------ //
  //  GET /posts/:id                                                      //
  // ------------------------------------------------------------------ //

  test.describe('GET /posts/:id', () => {
    test('should return HTTP 200 for post ID 1 @smoke', async ({ request }) => {
      const response = await request.get(`${BASE}/posts/1`);

      expect(response.status()).toBe(200);
      const post = await response.json() as Post;

      expect(post.id).toBe(1);
      expect(post.userId).toBeGreaterThan(0);
      expect(post.title.length).toBeGreaterThan(0);
    });

    // Negative — resource not found
    test('should return HTTP 404 for a non-existent post ID @regression', async ({ request }) => {
      const response = await request.get(`${BASE}/posts/99999`);

      expect(response.status()).toBe(404);
    });
  });

  // ------------------------------------------------------------------ //
  //  GET /posts?userId=N (query parameter filtering)                    //
  // ------------------------------------------------------------------ //

  test.describe('GET /posts?userId (filter by user)', () => {
    test('should return only posts belonging to the specified user @regression', async ({ request }) => {
      const userId = 1;
      const response = await request.get(`${BASE}/posts`, {
        params: { userId: String(userId) },
      });

      assertHttpSuccess(response.status());
      const posts = await response.json() as Post[];

      assertNonEmptyArray(posts);
      expect(posts.every((p) => p.userId === userId)).toBe(true);
    });
  });

  // ------------------------------------------------------------------ //
  //  POST /posts                                                         //
  // ------------------------------------------------------------------ //

  test.describe('POST /posts (create)', () => {
    test('should create a post and return HTTP 201 @smoke', async ({ request }) => {
      const payload: CreatePostRequest = {
        title: 'Automated test post',
        body: 'Created by Playwright API test suite',
        userId: 1,
      };

      const response = await request.post(`${BASE}/posts`, { data: payload });

      expect(response.status()).toBe(201);
      const created = await response.json() as Post & { id: number };

      expect(created.title).toBe(payload.title);
      expect(created.body).toBe(payload.body);
      expect(created.userId).toBe(payload.userId);
      // JSONPlaceholder assigns sequential IDs; new posts get id > 100
      expect(created.id).toBeGreaterThan(100);
    });

    // Data-driven — parameterised post titles
    const postScenarios: CreatePostRequest[] = [
      { title: 'First scenario', body: 'Body content A', userId: 1 },
      { title: 'Second scenario', body: 'Body content B', userId: 2 },
      { title: 'Third scenario', body: 'Body content C', userId: 3 },
    ];

    for (const scenario of postScenarios) {
      test(`should create post with title "${scenario.title}" @data-driven`, async ({ request }) => {
        const response = await request.post(`${BASE}/posts`, { data: scenario });

        expect(response.status()).toBe(201);
        const created = await response.json() as Post;
        expect(created.title).toBe(scenario.title);
      });
    }
  });

  // ------------------------------------------------------------------ //
  //  PATCH /posts/:id (partial update)                                  //
  // ------------------------------------------------------------------ //

  test.describe('PATCH /posts/:id', () => {
    test('should partially update a post @regression', async ({ request }) => {
      const response = await request.patch(`${BASE}/posts/1`, {
        data: { title: 'Patched title' },
      });

      expect(response.status()).toBe(200);
      const updated = await response.json() as Post;
      expect(updated.title).toBe('Patched title');
    });
  });

  // ------------------------------------------------------------------ //
  //  DELETE /posts/:id                                                  //
  // ------------------------------------------------------------------ //

  test.describe('DELETE /posts/:id', () => {
    test('should delete a post and return HTTP 200 @regression', async ({ request }) => {
      const response = await request.delete(`${BASE}/posts/1`);
      expect(response.status()).toBe(200);
    });
  });
});
