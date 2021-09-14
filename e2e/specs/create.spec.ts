import { expect } from 'chai';
import * as Page from './page';

describe('create', function () {
  beforeEach(async function () {
    await Page.open();
  });

  it('can create todo', async function () {
    await Page.createTodo('buy milk');
    const todosList = await Page.getTodosListElement();
    expect(todosList.length).to.eq(1);
  });
});
