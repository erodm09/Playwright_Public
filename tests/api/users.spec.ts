/**
 * Users API tests — https://reqres.in/api/users
 *
 * Validates the full CRUD surface of the reqres.in Users endpoint.
 *
 * Design notes:
 *  - Tests use the `reqresClient` fixture (injected via base.fixture.ts).
 *  - All response shapes are validated against TypeScript interfaces — a
 *    shape mismatch is caught at compile time, not at runtime.
 *  - Custom assertion helpers communicate *intent*, not just raw assertions.
 *  - The API project in playwright.config.ts sets baseURL = reqres.in,
 *    so no URL construction happens inside tests.
 */

import { test, expect } from '../../src/fixtures';
import {
  assertHttpSuccess,
  assertRequiredFields,
  assertRecentTimestamp,
  assertNonEmptyArray,
  assertAllItems,
} from '../../src/helpers/custom-assertions';
import { UserFactory } from '../../src/test-data/factories/user.factory';

test.describe('Users API — reqres.in', () => {

  // ------------------------------------------------------------------ //
  //  GET /api/users — list                                              //
  // ------------------------------------------------------------------ //

  test.describe('GET /api/users (list)', () => {
    test('should return HTTP 200 with a paginated user list @smoke', async ({ reqresClient }) => {
      const result = await reqresClient.getUsers(1);

      expect(result.ok).toBe(true);
      if (!result.ok) { return; }

      assertHttpSuccess(result.status);
      expect(result.data.page).toBe(1);
      expect(result.data.per_page).toBeGreaterThan(0);
      expect(result.data.total).toBeGreaterThan(0);
      assertNonEmptyArray(result.data.data, 'users array');
    });

    test('should return users with the required fields @regression', async ({ reqresClient }) => {
      const result = await reqresClient.getUsers(1);

      expect(result.ok).toBe(true);
      if (!result.ok) { return; }

      assertAllItems(
        result.data.data,
        (user) => typeof user.id === 'number' &&
                  typeof user.email === 'string' &&
                  typeof user.first_name === 'string' &&
                  typeof user.last_name === 'string',
        'user object has id, email, first_name, last_name',
      );
    });

    test('should return the correct number of items per page @regression', async ({ reqresClient }) => {
      const result = await reqresClient.getUsers(1);

      expect(result.ok).toBe(true);
      if (!result.ok) { return; }

      expect(result.data.data.length).toBeLessThanOrEqual(result.data.per_page);
    });

    test('should return a different set of users for page 2 @regression', async ({ reqresClient }) => {
      const [page1, page2] = await Promise.all([
        reqresClient.getUsers(1),
        reqresClient.getUsers(2),
      ]);

      expect(page1.ok).toBe(true);
      expect(page2.ok).toBe(true);
      if (!page1.ok || !page2.ok) { return; }

      const page1Ids = page1.data.data.map((u) => u.id);
      const page2Ids = page2.data.data.map((u) => u.id);

      // No ID should appear on both pages
      const overlap = page1Ids.filter((id) => page2Ids.includes(id));
      expect(overlap).toHaveLength(0);
    });
  });

  // ------------------------------------------------------------------ //
  //  GET /api/users/:id — single user                                   //
  // ------------------------------------------------------------------ //

  test.describe('GET /api/users/:id (single)', () => {
    test('should return HTTP 200 with user data for a valid ID @smoke', async ({ reqresClient }) => {
      const result = await reqresClient.getUserById(2);

      expect(result.ok).toBe(true);
      if (!result.ok) { return; }

      assertHttpSuccess(result.status);
      assertRequiredFields(
        result.data.data as unknown as Record<string, unknown>,
        ['id', 'email', 'first_name', 'last_name', 'avatar'],
      );
    });

    test('should return the correct user for ID 2 @regression', async ({ reqresClient }) => {
      const result = await reqresClient.getUserById(2);

      expect(result.ok).toBe(true);
      if (!result.ok) { return; }

      expect(result.data.data.id).toBe(2);
      expect(result.data.data.email).toBe('janet.weaver@reqres.in');
    });

    // Negative — non-existent resource
    test('should return HTTP 404 for a user ID that does not exist @regression', async ({ reqresClient }) => {
      const result = await reqresClient.getUserById(9999);

      expect(result.ok).toBe(false);
      if (result.ok) { return; }

      expect(result.status).toBe(404);
    });
  });

  // ------------------------------------------------------------------ //
  //  POST /api/users — create                                           //
  // ------------------------------------------------------------------ //

  test.describe('POST /api/users (create)', () => {
    test('should create a user and return HTTP 201 @smoke', async ({ reqresClient }) => {
      const payload = UserFactory.build();
      const result = await reqresClient.createUser(payload);

      expect(result.ok).toBe(true);
      if (!result.ok) { return; }

      expect(result.status).toBe(201);
      expect(result.data.name).toBe(payload.name);
      expect(result.data.job).toBe(payload.job);
    });

    test('should return a generated ID and createdAt timestamp @regression', async ({ reqresClient }) => {
      const result = await reqresClient.createUser(UserFactory.build());

      expect(result.ok).toBe(true);
      if (!result.ok) { return; }

      expect(result.data.id).toBeTruthy();
      assertRecentTimestamp(result.data.createdAt, 60, 'createdAt');
    });

    // Data-driven — multiple different user payloads
    const usersToCreate = UserFactory.buildMany(3);
    for (const [index, user] of usersToCreate.entries()) {
      test(`should create user #${index + 1} with name "${user.name}" @data-driven`, async ({ reqresClient }) => {
        const result = await reqresClient.createUser(user);

        expect(result.ok).toBe(true);
        if (!result.ok) { return; }

        expect(result.data.name).toBe(user.name);
        expect(result.data.job).toBe(user.job);
        expect(result.status).toBe(201);
      });
    }
  });

  // ------------------------------------------------------------------ //
  //  PUT /api/users/:id — full update                                   //
  // ------------------------------------------------------------------ //

  test.describe('PUT /api/users/:id (update)', () => {
    test('should update a user and return HTTP 200 @regression', async ({ reqresClient }) => {
      const updated = UserFactory.build({ job: 'Lead QA Engineer' });
      const result = await reqresClient.updateUser(2, updated);

      expect(result.ok).toBe(true);
      if (!result.ok) { return; }

      expect(result.status).toBe(200);
      expect(result.data.name).toBe(updated.name);
      expect(result.data.job).toBe('Lead QA Engineer');
      assertRecentTimestamp(result.data.updatedAt, 60, 'updatedAt');
    });
  });

  // ------------------------------------------------------------------ //
  //  DELETE /api/users/:id                                              //
  // ------------------------------------------------------------------ //

  test.describe('DELETE /api/users/:id', () => {
    test('should delete a user and return HTTP 204 No Content @regression', async ({ reqresClient }) => {
      const result = await reqresClient.deleteUser(2);

      expect(result.ok).toBe(true);
      if (!result.ok) { return; }

      expect(result.status).toBe(204);
    });
  });
});
