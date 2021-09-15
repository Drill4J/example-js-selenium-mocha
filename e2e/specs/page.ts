import { By, Key } from 'selenium-webdriver';

export async function open() {
  await global.driver.get(process.env.APP_URL);
}

export async function createTodo(message) {
  return createTodos([message]);
}

export async function createTodos(messages: string[]) {
  const inputElement = await global.driver.findElement(By.className('new-todo'));
  for (let i = 0; i < messages.length; i++) {
    await inputElement.sendKeys(messages[i], Key.RETURN);
  }
}

export async function toggleAll() {
  const toggleAllBtn = await global.driver.findElement(By.xpath('//label[@for="toggle-all"]'));
  const loc = await toggleAllBtn.getRect();
  // await global.driver.executeScript(`
  // document.body.addEventListener('click', function(e) { alert(e.x + ", " + e.y) })
  // `);
  await global.driver
    .actions()
    .move({ x: loc.x + 100, y: loc.y + 100 })
    .click()
    .perform();
}

// export async function editTodoWithText(prevText: string, textText: string) {
//   const todoElement = await findTodoWithText(prevText);
//   await global.driver.actions().doubleClick(todoElement);
// }

export async function findTodoWithText(text) {
  return global.driver.findElement(By.xpath(`//ul[@class='todo-list']/li[text() = ${text}]`));
}

export async function removeCompleted() {
  const clearAllBtn = await global.driver.findElement(By.className('clear-completed'));
  await clearAllBtn.click();
}

export async function removeAllTodos() {
  const todos = await getTodosListElement();
  if (todos.length === 0) return;
  await toggleAll(); // unreliable
  await removeCompleted();
}

export async function getTodosListElement() {
  return global.driver.findElements(By.xpath("//ul[@class='todo-list']/li"));
}
