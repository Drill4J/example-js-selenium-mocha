import { expect } from 'chai';
import * as Page from './page';

describe('edit', function () {
  beforeEach(async function () {
    await Page.open();
    await Page.createTodo('hello world');
  });

  it('can complete', async function () {
    const text = 'hello world';
    await Page.markTodoAsComplete(text);
    const todoElement = await Page.findCompletedTodo(text);
    expect(todoElement).to.exist;
  });
});
