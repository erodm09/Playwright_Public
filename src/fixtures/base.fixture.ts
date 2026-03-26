import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { TodoPage } from '../pages/todo.page';
import { JsonPlaceholderUsersClient } from '../api/jsonplaceholder-users.client';

/**
 * Custom fixture types — extend this interface to add new fixtures.
 *
 * Using Playwright's fixture system (rather than beforeEach helpers) gives us:
 *  - Automatic setup/teardown scoping (test | worker)
 *  - Dependency injection — test functions declare exactly what they need
 *  - Composable — fixtures can depend on other fixtures
 *  - Zero boilerplate in test files; each test gets a fresh, ready-to-use object
 */
type PageFixtures = {
  loginPage: LoginPage;
  todoPage: TodoPage;
};

type ApiFixtures = {
  usersApiClient: JsonPlaceholderUsersClient;
};

type AllFixtures = PageFixtures & ApiFixtures;

/**
 * Extended `test` object.
 *
 * Import `{ test, expect }` from `@fixtures/index` in every spec file —
 * never import directly from `@playwright/test`.  This single change gives
 * every test access to the full fixture set without any per-file setup.
 */
export const test = base.extend<AllFixtures>({
  // ------------------------------------------------------------------ //
  //  Page fixtures (test-scoped — new instance per test)                //
  // ------------------------------------------------------------------ //

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  todoPage: async ({ page }, use) => {
    await use(new TodoPage(page));
  },

  // ------------------------------------------------------------------ //
  //  API fixtures                                                        //
  // ------------------------------------------------------------------ //

  usersApiClient: async ({ request }, use) => {
    await use(new JsonPlaceholderUsersClient(request));
  },
});

// Re-export `expect` so callers only need one import
export { expect } from '@playwright/test';
