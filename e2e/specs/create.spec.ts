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

  ['value1', 'value2'].forEach(val => {
    describe(`Parameterized suite with param "${val}" value`, function () {
      it('create message', async function () {
        const message = `This is ${val} message`;
        await Page.createTodo(message);
        await Page.findTodoWithText(message);
      });
      it(`case with param "${val}"`, async function () {
        const message = `This is ${val} plan message`;
        await Page.createTodo(message);
        await Page.findTodoWithText(message);
      });
    });
  });

  it('name with regex-specific characters: ()[]', async function () {
    const message = 'regex-specific example';
    await Page.createTodo(message);
    await Page.findTodoWithText(message);
  });
});
