import { Builder, Capabilities, WebDriver } from 'selenium-webdriver';
import { exec } from 'child_process';
import os from 'os';

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

// runs ONLY ONCE both in parallel and serial mode
export async function mochaGlobalSetup() {
  await startSeleniumServer();
}

// runs ONLY ONCE both in parallel and serial mode
export async function mochaGlobalTeardown() {
  await stopSeleniumServer();
}

async function prepareWebdriver() {
  const chromeCapabilities = Capabilities.chrome();
  chromeCapabilities.set('chromeOptions', {
    args: ['--headless', `--remote-debugging-port=${process.env.CDP_PORT}`, '--remote-debugging-address=0.0.0.0'],
  });

  return new Builder().forBrowser('chrome').usingServer(process.env.SELENIUM_HUB_URL).withCapabilities(chromeCapabilities).build();
}

async function startSeleniumServer() {
  try {
    await executeCommand('docker-compose -f e2e/docker-compose.yml down && docker-compose -f e2e/docker-compose.yml up -d', 5000);
  } catch (e) {
    throw new Error(`Failed to start Selenium Server. Reason: ${e?.message}`);
  }
}

async function stopSeleniumServer() {
  try {
    await executeCommand('docker-compose -f e2e/docker-compose.yml down');
  } catch (e) {
    throw new Error(`Failed to stop Selenium Server. Reason: ${e?.message}`);
  }
}

async function executeCommand(cmd, delay = 100) {
  console.log('\x1b[33m%s\x1b[0m', cmd); // print cmd in yellow
  const options = {};
  if (os.platform() === 'win32') {
    (options as any).shell = 'bash';
  }
  const data = await new Promise((resolve, reject) => {
    exec(cmd, options, (err, stdout, stderr) => {
      if (err) {
        (err as any).stderr = stderr;
        reject(err);
        return;
      }
      resolve(stdout);
    });
  });
  await sleep(delay);
  return data;
}

function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}
