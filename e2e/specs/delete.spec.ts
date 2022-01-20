import { expect } from 'chai';
import * as Page from './page';

describe('delete', function () {
  beforeEach(async function () {
    await Page.open();
    await Page.createTodos(['buy milk', 'clean the stove', 'throw away litter']);
  });

  it('can delete one', async function () {
    const todosListBefore = await Page.getTodosListElement();
    await Page.removeTodo('buy milk');
    const todosListAfter = await Page.getTodosListElement();
    expect(todosListAfter.length).to.be.lessThan(todosListBefore.length);
  });

  describe('nested suite', () => {
    it('can delete all', async function () {
      await Page.removeAllTodos();
      const todosList = await Page.getTodosListElement();
      expect(todosList.length).to.eq(0);
    });
  });
});
