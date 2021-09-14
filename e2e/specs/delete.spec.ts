import { expect } from 'chai';
import { PageLoadStrategy } from 'selenium-webdriver/lib/capabilities';
import * as Page from './page';

describe('delete', function () {
  beforeEach(async function () {
    await Page.open();
    await Page.createTodos(['buy milk', 'clean the stove', 'throw away litter']);
  });

  it('can delete all todo-s', async function () {
    await Page.removeAllTodos();
    const todosList = await Page.getTodosListElement();
    expect(todosList.length).to.eq(0);
  });
});
