/**
 * Todo management E2E tests — https://demo.playwright.dev/todomvc
 *
 * Covers the full CRUD lifecycle of a TodoMVC item plus filter behaviour.
 *
 * Tags:
 *  @smoke      — critical happy-path scenarios run on every commit
 *  @regression — broader coverage run on PRs and nightly
 *  @data-driven — parameterised over a set of todo items
 */

import { test } from '../../../src/fixtures';
import todoData from '../../../src/test-data/todo-items.json';

test.describe('Todo Management', () => {
  test.beforeEach(async ({ todoPage }) => {
    await todoPage.navigate();
  });

  // ------------------------------------------------------------------ //
  //  Create                                                              //
  // ------------------------------------------------------------------ //

  test('should add a single todo item @smoke', async ({ todoPage }) => {
    const [item] = todoData.singleItems;
    await todoPage.addTodo(item!);

    await todoPage.assertTodoCount(1);
    await todoPage.assertTodoVisible(item!);
    await todoPage.assertItemsLeftCount(1);
  });

  test('should add multiple todo items @smoke', async ({ todoPage }) => {
    await todoPage.addTodos(todoData.multipleItems);

    await todoPage.assertTodoCount(todoData.multipleItems.length);
    await todoPage.assertItemsLeftCount(todoData.multipleItems.length);
  });

  // ------------------------------------------------------------------ //
  //  Complete / uncomplete                                               //
  // ------------------------------------------------------------------ //

  test('should mark a todo as completed @smoke', async ({ todoPage }) => {
    const [item] = todoData.singleItems;
    await todoPage.addTodo(item!);
    await todoPage.completeTodo(item!);

    await todoPage.assertTodoCompleted(item!);
    await todoPage.assertItemsLeftCount(0);
  });

  test('should toggle all todos to completed @regression', async ({ todoPage }) => {
    await todoPage.addTodos(todoData.multipleItems);
    await todoPage.toggleAllItems();

    for (const item of todoData.multipleItems) {
      await todoPage.assertTodoCompleted(item);
    }
    await todoPage.assertItemsLeftCount(0);
  });

  test('should uncheck a completed todo @regression', async ({ todoPage }) => {
    const [item] = todoData.singleItems;
    await todoPage.addTodo(item!);
    await todoPage.completeTodo(item!);
    await todoPage.assertTodoCompleted(item!);

    // Toggle it back to active
    await todoPage.completeTodo(item!);
    await todoPage.assertTodoActive(item!);
    await todoPage.assertItemsLeftCount(1);
  });

  // ------------------------------------------------------------------ //
  //  Edit                                                                //
  // ------------------------------------------------------------------ //

  test('should edit an existing todo @regression', async ({ todoPage }) => {
    const scenario = todoData.editScenarios[0]!;
    await todoPage.addTodo(scenario.original);
    await todoPage.editTodo(scenario.original, scenario.updated);

    await todoPage.assertTodoVisible(scenario.updated);
    await todoPage.assertTodoNotVisible(scenario.original);
  });

  // ------------------------------------------------------------------ //
  //  Delete                                                              //
  // ------------------------------------------------------------------ //

  test('should delete a todo @regression', async ({ todoPage }) => {
    const [item] = todoData.singleItems;
    await todoPage.addTodo(item!);
    await todoPage.deleteTodo(item!);

    await todoPage.assertTodoCount(0);
  });

  test('should clear all completed todos @regression', async ({ todoPage }) => {
    await todoPage.addTodos(todoData.multipleItems);

    // Complete the first two items
    await todoPage.completeTodo(todoData.multipleItems[0]!);
    await todoPage.completeTodo(todoData.multipleItems[1]!);

    await todoPage.clearAllCompleted();

    await todoPage.assertTodoNotVisible(todoData.multipleItems[0]!);
    await todoPage.assertTodoNotVisible(todoData.multipleItems[1]!);
    await todoPage.assertTodoCount(todoData.multipleItems.length - 2);
  });

  // ------------------------------------------------------------------ //
  //  Filtering                                                           //
  // ------------------------------------------------------------------ //

  test('should show only active todos when Active filter is selected @regression', async ({ todoPage }) => {
    await todoPage.addTodos(todoData.multipleItems);
    await todoPage.completeTodo(todoData.multipleItems[0]!);
    await todoPage.filterBy('Active');

    // Completed item should not be visible in the Active view
    await todoPage.assertTodoNotVisible(todoData.multipleItems[0]!);
    // Active items remain visible
    await todoPage.assertTodoVisible(todoData.multipleItems[1]!);
  });

  test('should show only completed todos when Completed filter is selected @regression', async ({ todoPage }) => {
    await todoPage.addTodos(todoData.multipleItems);
    await todoPage.completeTodo(todoData.multipleItems[0]!);
    await todoPage.filterBy('Completed');

    await todoPage.assertTodoVisible(todoData.multipleItems[0]!);
    await todoPage.assertTodoNotVisible(todoData.multipleItems[1]!);
  });

  test('should restore all items when All filter is selected @regression', async ({ todoPage }) => {
    await todoPage.addTodos(todoData.multipleItems);
    await todoPage.completeTodo(todoData.multipleItems[0]!);

    // Switch to Completed then back to All
    await todoPage.filterBy('Completed');
    await todoPage.filterBy('All');

    await todoPage.assertTodoCount(todoData.multipleItems.length);
  });

  // ------------------------------------------------------------------ //
  //  Data-driven — add each item individually and verify                //
  // ------------------------------------------------------------------ //

  for (const item of todoData.singleItems) {
    test(`should add and display todo item: "${item}" @data-driven`, async ({ todoPage }) => {
      await todoPage.addTodo(item);
      await todoPage.assertTodoVisible(item);
      await todoPage.assertTodoActive(item);
    });
  }

  // ------------------------------------------------------------------ //
  //  Boundary / negative                                                //
  // ------------------------------------------------------------------ //

  test('should not add an empty todo when Enter is pressed @regression', async ({ todoPage, page }) => {
    // Press Enter on an empty input — no item should be added
    await page.locator('.new-todo').press('Enter');
    await todoPage.assertTodoCount(0);
  });

  test('should maintain todo count accurately across add and delete operations @regression', async ({ todoPage }) => {
    const items = todoData.multipleItems.slice(0, 3);
    await todoPage.addTodos(items);
    await todoPage.assertItemsLeftCount(3);

    await todoPage.completeTodo(items[0]!);
    await todoPage.assertItemsLeftCount(2);

    await todoPage.deleteTodo(items[1]!);
    // items[1] was active so count drops to 1
    await todoPage.assertItemsLeftCount(1);
  });
});
