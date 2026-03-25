import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { BasePage } from './base.page';

/** Available filter tabs in the TodoMVC footer. */
export type TodoFilter = 'All' | 'Active' | 'Completed';

/**
 * TodoPage — Page Object for https://demo.playwright.dev/todomvc
 *
 * The TodoMVC React app is a canonical Playwright demo target.
 * This PO encapsulates every meaningful interaction so that test specs
 * read as plain-English scenarios, with zero selector leakage.
 */
export class TodoPage extends BasePage {
  private readonly newTodoInput = this.page.locator('.new-todo');
  private readonly todoItems = this.page.locator('.todo-list li');
  private readonly toggleAll = this.page.locator('.toggle-all');
  private readonly clearCompleted = this.page.locator('.clear-completed');
  private readonly todoCount = this.page.locator('.todo-count');

  static readonly PATH = '/todomvc';

  // ------------------------------------------------------------------ //
  //  Navigation                                                          //
  // ------------------------------------------------------------------ //

  async navigate(): Promise<void> {
    await this.goto(TodoPage.PATH);
    // Wait for the input to be ready before the test starts interacting
    await expect(this.newTodoInput).toBeVisible();
  }

  // ------------------------------------------------------------------ //
  //  Actions                                                             //
  // ------------------------------------------------------------------ //

  /** Add a single todo item. */
  async addTodo(text: string): Promise<void> {
    await this.newTodoInput.fill(text);
    await this.newTodoInput.press('Enter');
  }

  /** Add multiple todo items in sequence. */
  async addTodos(items: string[]): Promise<void> {
    for (const item of items) {
      await this.addTodo(item);
    }
  }

  /** Check/complete a todo by its visible label text. */
  async completeTodo(text: string): Promise<void> {
    await this.getTodoByText(text).locator('.toggle').click();
  }

  /** Delete a todo by hovering to reveal the destroy button. */
  async deleteTodo(text: string): Promise<void> {
    const item = this.getTodoByText(text);
    await item.hover();
    await item.locator('.destroy').click();
  }

  /** Double-click a todo to enter edit mode, clear it, and type new text. */
  async editTodo(currentText: string, newText: string): Promise<void> {
    const item = this.getTodoByText(currentText);
    await item.dblclick();
    const editInput = item.locator('.edit');
    await editInput.fill(newText);
    await editInput.press('Enter');
  }

  /** Click the "Toggle all" checkbox to complete/uncomplete every item. */
  async toggleAllItems(): Promise<void> {
    await this.toggleAll.click();
  }

  /** Clear all completed todos via the footer button. */
  async clearAllCompleted(): Promise<void> {
    await this.clearCompleted.click();
  }

  /** Click one of the filter tabs (All / Active / Completed). */
  async filterBy(filter: TodoFilter): Promise<void> {
    await this.page.locator('.filters').getByRole('link', { name: filter }).click();
  }

  // ------------------------------------------------------------------ //
  //  Assertions                                                          //
  // ------------------------------------------------------------------ //

  async assertTodoCount(expected: number): Promise<void> {
    await expect(this.todoItems).toHaveCount(expected);
  }

  async assertTodoVisible(text: string): Promise<void> {
    await expect(this.getTodoByText(text)).toBeVisible();
  }

  async assertTodoNotVisible(text: string): Promise<void> {
    await expect(this.getTodoByText(text)).not.toBeVisible();
  }

  async assertTodoCompleted(text: string): Promise<void> {
    await expect(this.getTodoByText(text)).toHaveClass(/completed/);
  }

  async assertTodoActive(text: string): Promise<void> {
    await expect(this.getTodoByText(text)).not.toHaveClass(/completed/);
  }

  async assertItemsLeftCount(count: number): Promise<void> {
    await expect(this.todoCount).toContainText(
      `${count} item${count === 1 ? '' : 's'} left`,
    );
  }

  async assertClearCompletedVisible(): Promise<void> {
    await expect(this.clearCompleted).toBeVisible();
  }

  // ------------------------------------------------------------------ //
  //  State queries                                                       //
  // ------------------------------------------------------------------ //

  async getTodoTexts(): Promise<string[]> {
    return this.todoItems.locator('label').allInnerTexts();
  }

  async getTodoCount(): Promise<number> {
    return this.todoItems.count();
  }

  // ------------------------------------------------------------------ //
  //  Internal helpers                                                    //
  // ------------------------------------------------------------------ //

  /** Locate a single todo list item by its exact visible label. */
  private getTodoByText(text: string): Locator {
    return this.todoItems.filter({ hasText: text });
  }
}
