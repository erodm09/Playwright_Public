/**
 * Login E2E tests — https://practicetestautomation.com/practice-test-login/
 *
 * Covers:
 *  - @smoke  Happy path login and logout
 *  - @regression  Negative / boundary scenarios
 *  - @data-driven  Parameterised invalid-credential cases
 *
 * Design notes:
 *  - Page interactions are entirely delegated to LoginPage.
 *  - Test data lives in src/test-data/users.json — no magic strings here.
 *  - Each test is atomic: no shared state or ordering dependency.
 */

import { test, expect } from '../../../src/fixtures';
import userData from '../../../src/test-data/users.json';

test.describe('Authentication — Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigate();
  });

  // ------------------------------------------------------------------ //
  //  Happy path                                                          //
  // ------------------------------------------------------------------ //

  test(
    'should log in successfully with valid credentials @smoke',
    async ({ loginPage }) => {
      await loginPage.login(
        userData.validCredentials.username,
        userData.validCredentials.password,
      );

      await loginPage.assertLoginSuccess();
      await loginPage.assertLogoutButtonVisible();
    },
  );

  test(
    'should redirect to the success page after login @smoke',
    async ({ loginPage, page }) => {
      await loginPage.login(
        userData.validCredentials.username,
        userData.validCredentials.password,
      );

      await expect(page).toHaveURL(/logged-in-successfully/);
    },
  );

  test(
    'should allow the user to log out after logging in @regression',
    async ({ loginPage }) => {
      await loginPage.login(
        userData.validCredentials.username,
        userData.validCredentials.password,
      );
      await loginPage.assertLoginSuccess();
      await loginPage.logout();

      // After logout the login form should be accessible again
      await loginPage.navigate();
      await loginPage.assertUrlContains('practice-test-login');
    },
  );

  // ------------------------------------------------------------------ //
  //  Negative scenarios                                                  //
  // ------------------------------------------------------------------ //

  test(
    'should show an error for an incorrect username @regression',
    async ({ loginPage }) => {
      const { username, password, expectedError } = userData.invalidCredentials[0]!;
      await loginPage.login(username, password);
      await loginPage.assertErrorMessage(expectedError);
    },
  );

  test(
    'should show an error for an incorrect password @regression',
    async ({ loginPage }) => {
      const { username, password, expectedError } = userData.invalidCredentials[1]!;
      await loginPage.login(username, password);
      await loginPage.assertErrorMessage(expectedError);
    },
  );

  // ------------------------------------------------------------------ //
  //  Data-driven — parameterised over all invalid-credential scenarios  //
  // ------------------------------------------------------------------ //

  for (const scenario of userData.invalidCredentials) {
    test(
      `should display an error message — ${scenario.description} @regression`,
      async ({ loginPage }) => {
        await loginPage.login(scenario.username, scenario.password);
        await loginPage.assertErrorMessage(scenario.expectedError);
      },
    );
  }
});
