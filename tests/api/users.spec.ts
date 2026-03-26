/**
 * Users API tests — https://jsonplaceholder.typicode.com/users
 *
 * JSONPlaceholder is used instead of reqres.in because reqres is often blocked
 * by Cloudflare (403) when requests originate from CI runners.
 */

import { test, expect } from '../../src/fixtures';
import {
  assertHttpSuccess,
  assertRequiredFields,
  assertNonEmptyArray,
  assertAllItems,
} from '../../src/helpers/custom-assertions';
import { UserFactory } from '../../src/test-data/factories/user.factory';

test.describe('Users API — jsonplaceholder.typicode.com', () => {

  // ------------------------------------------------------------------ //
  //  GET /users — list                                                  //
  // ------------------------------------------------------------------ //

  test.describe('GET /users (list)', () => {
    test('should return HTTP 200 with a user list @smoke', async ({ usersApiClient }) => {
      const result = await usersApiClient.getUsers(1);

      expect(result.ok).toBe(true);
      if (!result.ok) { return; }

      assertHttpSuccess(result.status);
      assertNonEmptyArray(result.data, 'users array');
      expect(result.data.length).toBeLessThanOrEqual(6);
    });

    test('should return users with the required fields @regression', async ({ usersApiClient }) => {
      const result = await usersApiClient.getUsers(1);

      expect(result.ok).toBe(true);
      if (!result.ok) { return; }

      assertAllItems(
        result.data,
        (user) => typeof user.id === 'number' &&
                  typeof user.email === 'string' &&
                  typeof user.name === 'string' &&
                  typeof user.username === 'string',
        'user object has id, email, name, username',
      );
    });

    test('should return at most the requested page size @regression', async ({ usersApiClient }) => {
      const result = await usersApiClient.getUsers(1);

      expect(result.ok).toBe(true);
      if (!result.ok) { return; }

      expect(result.data.length).toBeLessThanOrEqual(6);
    });

    test('should return a different set of users for page 2 @regression', async ({ usersApiClient }) => {
      const [page1, page2] = await Promise.all([
        usersApiClient.getUsers(1),
        usersApiClient.getUsers(2),
      ]);

      expect(page1.ok).toBe(true);
      expect(page2.ok).toBe(true);
      if (!page1.ok || !page2.ok) { return; }

      const page1Ids = page1.data.map((u) => u.id);
      const page2Ids = page2.data.map((u) => u.id);

      const overlap = page1Ids.filter((id) => page2Ids.includes(id));
      expect(overlap).toHaveLength(0);
    });
  });

  // ------------------------------------------------------------------ //
  //  GET /users/:id — single user                                       //
  // ------------------------------------------------------------------ //

  test.describe('GET /users/:id (single)', () => {
    test('should return HTTP 200 with user data for a valid ID @smoke', async ({ usersApiClient }) => {
      const result = await usersApiClient.getUserById(2);

      expect(result.ok).toBe(true);
      if (!result.ok) { return; }

      assertHttpSuccess(result.status);
      assertRequiredFields(
        result.data as unknown as Record<string, unknown>,
        ['id', 'email', 'name', 'username'],
      );
    });

    test('should return the correct user for ID 2 @regression', async ({ usersApiClient }) => {
      const result = await usersApiClient.getUserById(2);

      expect(result.ok).toBe(true);
      if (!result.ok) { return; }

      expect(result.data.id).toBe(2);
      expect(result.data.email).toBe('Shanna@melissa.tv');
    });

    test('should return HTTP 404 for a user ID that does not exist @regression', async ({ usersApiClient }) => {
      const result = await usersApiClient.getUserById(9999);

      expect(result.ok).toBe(false);
      if (result.ok) { return; }

      expect(result.status).toBe(404);
    });
  });

  // ------------------------------------------------------------------ //
  //  POST /users — create                                               //
  // ------------------------------------------------------------------ //

  test.describe('POST /users (create)', () => {
    test('should create a user and return HTTP 201 @smoke', async ({ usersApiClient }) => {
      const payload = UserFactory.build();
      const result = await usersApiClient.createUser(payload);

      expect(result.ok).toBe(true);
      if (!result.ok) { return; }

      expect(result.status).toBe(201);
      expect(result.data.name).toBe(payload.name);
      expect(result.data.email).toBe(payload.email);
    });

    test('should return a generated id @regression', async ({ usersApiClient }) => {
      const result = await usersApiClient.createUser(UserFactory.build());

      expect(result.ok).toBe(true);
      if (!result.ok) { return; }

      expect(typeof result.data.id).toBe('number');
      expect(result.data.id).toBeGreaterThan(0);
    });

    const usersToCreate = UserFactory.buildMany(3);
    for (const [index, user] of usersToCreate.entries()) {
      test(`should create user #${index + 1} via POST @data-driven`, async ({ usersApiClient }) => {
        const result = await usersApiClient.createUser(user);

        expect(result.ok).toBe(true);
        if (!result.ok) { return; }

        expect(result.data.name).toBe(user.name);
        expect(result.status).toBe(201);
      });
    }
  });

  // ------------------------------------------------------------------ //
  //  PUT /users/:id — full update                                       //
  // ------------------------------------------------------------------ //

  test.describe('PUT /users/:id (update)', () => {
    test('should update a user and return HTTP 200 @regression', async ({ usersApiClient }) => {
      const updated = UserFactory.build({ job: 'Lead QA Engineer' });
      const result = await usersApiClient.updateUser(2, updated);

      expect(result.ok).toBe(true);
      if (!result.ok) { return; }

      expect(result.status).toBe(200);
      expect(result.data.name).toBe(updated.name);
      expect(result.data.email).toBe(updated.email);
    });
  });

  // ------------------------------------------------------------------ //
  //  DELETE /users/:id                                                  //
  // ------------------------------------------------------------------ //

  test.describe('DELETE /users/:id', () => {
    test('should delete a user and return HTTP 200 @regression', async ({ usersApiClient }) => {
      const result = await usersApiClient.deleteUser(2);

      expect(result.ok).toBe(true);
      if (!result.ok) { return; }

      expect(result.status).toBe(200);
    });
  });
});
