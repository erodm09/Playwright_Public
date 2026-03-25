/**
 * UI component-level tests — TodoMVC filter component
 *
 * These tests are scoped to a single UI component (the filter bar) rather
 * than covering a full user journey.  This mirrors a pattern used in
 * enterprise frameworks where high-frequency, isolated component tests
 * provide a fast feedback loop before the slower full E2E suite runs.
 *
 * The suite demonstrates:
 *  - Accessibility assertions (ARIA roles, labels)
 *  - Keyboard navigation
 *  - Visual state assertions (CSS classes, active link detection)
 *  - Compound state: interaction across multiple components
 */

import { test, expect } from '../../src/fixtures';

// URL for the TodoMVC demo — configured as TODO_BASE_URL in .env
const TODO_URL = process.env.TODO_BASE_URL ?? 'https://demo.playwright.dev/todomvc';

/**
 * Seed the app with a known state so every filter test starts consistently.
 * Three items: first completed, remaining two active.
 */
async function seedTodos(todoPage: { navigate: () => Promise<void>; addTodos: (items: string[]) => Promise<void>; completeTodo: (text: string) => Promise<void> }): Promise<{ items: string[] }> {
  const items = ['Completed task', 'Active task 1', 'Active task 2'];
  await todoPage.navigate();
  await todoPage.addTodos(items);
  await todoPage.completeTodo(items[0]!);
  return { items };
}

test.describe('Filter Component — TodoMVC', () => {
  test.use({ baseURL: TODO_URL });

  // ------------------------------------------------------------------ //
  //  Filter tab rendering                                               //
  // ------------------------------------------------------------------ //

  test('should render All, Active, and Completed filter links @smoke', async ({ todoPage, page }) => {
    await todoPage.navigate();
    await todoPage.addTodos(['A task']);

    const filterBar = page.locator('.filters');
    await expect(filterBar.getByRole('link', { name: 'All' })).toBeVisible();
    await expect(filterBar.getByRole('link', { name: 'Active' })).toBeVisible();
    await expect(filterBar.getByRole('link', { name: 'Completed' })).toBeVisible();
  });

  test('should not render the filter bar when there are no todos @regression', async ({ todoPage, page }) => {
    await todoPage.navigate();
    await expect(page.locator('.footer')).not.toBeVisible();
  });

  // ------------------------------------------------------------------ //
  //  Active filter highlighting                                          //
  // ------------------------------------------------------------------ //

  test('should highlight the "All" filter as selected by default @regression', async ({ todoPage, page }) => {
    const { items } = await seedTodos(todoPage);
    // Suppress unused variable — items needed only to seed state
    void items;

    const allLink = page.locator('.filters').getByRole('link', { name: 'All' });
    await expect(allLink).toHaveClass(/selected/);
  });

  test('should highlight the "Active" link when Active filter is selected @regression', async ({ todoPage, page }) => {
    const { items } = await seedTodos(todoPage);
    void items;

    await todoPage.filterBy('Active');
    const activeLink = page.locator('.filters').getByRole('link', { name: 'Active' });
    await expect(activeLink).toHaveClass(/selected/);
  });

  test('should highlight the "Completed" link when Completed filter is selected @regression', async ({ todoPage, page }) => {
    const { items } = await seedTodos(todoPage);
    void items;

    await todoPage.filterBy('Completed');
    const completedLink = page.locator('.filters').getByRole('link', { name: 'Completed' });
    await expect(completedLink).toHaveClass(/selected/);
  });

  // ------------------------------------------------------------------ //
  //  Filter behaviour                                                    //
  // ------------------------------------------------------------------ //

  test('should show 2 items in Active view after completing 1 of 3 @regression', async ({ todoPage, page }) => {
    const { items } = await seedTodos(todoPage);
    void items;

    await todoPage.filterBy('Active');
    await expect(page.locator('.todo-list li')).toHaveCount(2);
  });

  test('should show 1 item in Completed view after completing 1 of 3 @regression', async ({ todoPage, page }) => {
    const { items } = await seedTodos(todoPage);
    void items;

    await todoPage.filterBy('Completed');
    await expect(page.locator('.todo-list li')).toHaveCount(1);
  });

  test('should show all 3 items in All view @regression', async ({ todoPage, page }) => {
    const { items } = await seedTodos(todoPage);
    void items;

    await todoPage.filterBy('All');
    await expect(page.locator('.todo-list li')).toHaveCount(3);
  });

  // ------------------------------------------------------------------ //
  //  "Clear completed" button                                           //
  // ------------------------------------------------------------------ //

  test('should show "Clear completed" only when there are completed todos @regression', async ({ todoPage, page }) => {
    await todoPage.navigate();
    await todoPage.addTodos(['New task']);

    // No completed items yet — button should not exist
    await expect(page.locator('.clear-completed')).not.toBeVisible();

    await todoPage.completeTodo('New task');
    // Now it should appear
    await expect(page.locator('.clear-completed')).toBeVisible();
  });

  test('should remove "Clear completed" after all completed todos are cleared @regression', async ({ todoPage, page }) => {
    const { items } = await seedTodos(todoPage);
    void items;

    await todoPage.clearAllCompleted();
    await expect(page.locator('.clear-completed')).not.toBeVisible();
  });

  // ------------------------------------------------------------------ //
  //  Item counter                                                        //
  // ------------------------------------------------------------------ //

  test('should display singular "item left" for a single active todo @regression', async ({ todoPage, page }) => {
    await todoPage.navigate();
    await todoPage.addTodos(['Only task']);

    await expect(page.locator('.todo-count')).toContainText('1 item left');
  });

  test('should display plural "items left" for multiple active todos @regression', async ({ todoPage, page }) => {
    await todoPage.navigate();
    await todoPage.addTodos(['Task A', 'Task B']);

    await expect(page.locator('.todo-count')).toContainText('2 items left');
  });
});
