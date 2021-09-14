import { Builder, Capabilities, WebDriver } from 'selenium-webdriver';

declare global {
  namespace NodeJS {
    interface Global {
      driver: WebDriver;
    }
  }
}

export const mochaHooks = {
  // runs FOR EVERY FILE in parallel mode, and ONCE in serial mode
  async beforeAll() {
    global.driver = await prepareWebdriver();
  },
  // runs FOR EVERY FILE in parallel mode, and ONCE in serial mode
  async afterAll() {
    await global.driver.close();
  },
};

async function prepareWebdriver() {
  const chromeCapabilities = Capabilities.chrome();
  chromeCapabilities.set('chromeOptions', { args: ['--headless'] });
  return new Builder().forBrowser('chrome').usingServer(process.env.SELENIUM_HUB_URL).withCapabilities(chromeCapabilities).build();
}

// // runs ONLY ONCE both in parallel and serial mode
// export async function mochaGlobalSetup() {
//   return new Promise(res => setTimeout(res, 100))
// }

// // runs ONLY ONCE both in parallel and serial mode
// export async function mochaGlobalTeardown() {
//   return new Promise(res => setTimeout(res, 100))
// }
