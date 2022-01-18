import { By, Key, WebDriver } from 'selenium-webdriver';
import fs from 'fs';

export async function open() {
  await (global.driver as WebDriver).get(process.env.APP_URL);
}

export async function createTodo(message) {
  return createTodos([message]);
}

export async function createTodos(messages: string[]) {
  const inputElement = await (global.driver as WebDriver).findElement(By.className('new-todo'));
  for (let i = 0; i < messages.length; i++) {
    await inputElement.sendKeys(messages[i], Key.RETURN);
  }
}

export async function toggleAll() {
  await (global.driver as WebDriver).executeScript(
    `document.querySelector("#toggle-all").dispatchEvent(new MouseEvent("click", { view: window, bubbles: true, cancelable: false }))`,
  );
}

export async function markTodoAsComplete(text) {
  const todoCheckbox = await (global.driver as WebDriver).findElement(
    By.xpath(`//ul[@class='todo-list']/li/div/input[../label[text() = "${text}"]]`),
  );
  await todoCheckbox.click();
}

export async function removeTodo(text) {
  await (global.driver as WebDriver).executeScript(
    `document.evaluate("//ul[@class='todo-list']/li/div/button[@class='destroy' and ../label[text() = '${text}']]", document).iterateNext().dispatchEvent(new MouseEvent("click", { view: window, bubbles: true, cancelable: false }));`,
    // `document.evaluate('//ul[@class='todo-list']/li/div/button[@class='destroy' and ../label[text() = "${text}"]]', document).iterateNext().dispatchEvent(new MouseEvent("click", { view: window, bubbles: true, cancelable: false }));`,
  );
  // const removeButton = await (global.driver as WebDriver).findElement(
  //   By.xpath(`//ul[@class='todo-list']/li/div/button[@class='destroy' and ../label[text() = "${text}"]]`),
  // );
  // document.evaluate(`//ul[@class='todo-list']/li/div/input[../label[text() = "123"]]`, document).iterateNext()
  // const html = await removeButton.getAttribute('outerHTML');
}

export async function findCompletedTodo(text) {
  return (global.driver as WebDriver).findElement(
    By.xpath(`//ul[@class='todo-list']/li[@class='ng-scope completed' and ./div/input[../label[text() = "${text}"]]]`),
  );
}
//ul[@class='todo-list']/li[@class='ng-scope completed' and ./div/input[../label[text() = "123"]]]
//ul[@class='todo-list']/li[@class='ng-scope completed' and /div/input[../label[text() = "123"]]]

// async function getTodoFormInput() {
//   return (global.driver as WebDriver).findElement(By.xpath(`/html/body/section/section/ul/li/form/input`));
// }

export async function findTodoWithText(text) {
  return (global.driver as WebDriver).findElement(By.xpath(`//ul[@class='todo-list']/li/div/label[text() = "${text}"]`));
}

export async function removeCompleted() {
  const clearAllBtn = await (global.driver as WebDriver).findElement(By.className('clear-completed'));
  await clearAllBtn.click();
}

export async function removeAllTodos() {
  const todos = await getTodosListElement();
  if (todos.length === 0) return;
  await toggleAll(); // unreliable
  await removeCompleted();
}

export async function getTodosListElement() {
  return (global.driver as WebDriver).findElements(By.xpath("//ul[@class='todo-list']/li"));
}

export async function takeScreenshot(prefix) {
  const image = await (global.driver as WebDriver).takeScreenshot();
  await new Promise((resolve, reject) =>
    fs.writeFile(`${prefix}-${Date.now()}.png`, image, 'base64', function (err) {
      if (err) reject(err);
      resolve(null);
    }),
  );
}
