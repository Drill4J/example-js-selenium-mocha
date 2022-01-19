import { expect } from 'chai';
import * as Page from './page';

describe('create', function () {
  beforeEach(async function () {
    await Page.open();
  });

  it('can create', async function () {
    await Page.createTodo('save the princess');
    const todosList = await Page.getTodosListElement();
    expect(todosList.length).to.eq(1);
  });

  it("can't add empty todo (white spaces only)", async function () {
    const todosListBefore = await Page.getTodosListElement();
    await Page.createTodo('   ');
    const todosListAfter = await Page.getTodosListElement();
    expect(todosListBefore.length).to.eq(todosListAfter.length);
  });
});
