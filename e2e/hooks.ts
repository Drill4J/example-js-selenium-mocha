import { Builder, Capabilities, WebDriver } from 'selenium-webdriver';
import { exec } from 'child_process';
import os from 'os';
import { Drill, AdminAPI } from '@drill4j/js-auto-test-agent';
import axios from 'axios';
import { Runnable } from 'mocha';

let drill: Drill;

export const mochaHooks = {
  async beforeAll() {
    this.timeout(0); // for debug only

    const chromeCapabilities = Capabilities.chrome();
    chromeCapabilities.set('chromeOptions', {
      args: [
        // not important, used only for example
        '--headless',
        // these are very important, you likely don't wanna change them
        '--remote-debugging-port=9222',
        '--remote-debugging-address=0.0.0.0',
      ],
    });

    global.driver = await new Builder()
      .forBrowser('chrome')
      .usingServer(process.env.SELENIUM_HUB_URL)
      .withCapabilities(chromeCapabilities)
      .build();

    const res = await axios.get(`http://localhost:9222/json/version`);
    const webSocketDebuggerUrl = (res.data.webSocketDebuggerUrl as string).replace('localhost', 'host.docker.internal');

    drill = new Drill({
      adminUrl: process.env.ADMIN_URL,
      devtoolsProxyUrl: process.env.DEVTOOLS_PROXY_URL,

      // Agent's ID
      agentId: process.env.AGENT_ID,

      // Your application's url
      targetHost: process.env.APP_URL,

      // An arbitrary string, whatever you'd like to identify these tests by
      engine: 'mocha+selenium',

      // devtoolsUrl: 'http://localhost:9222',
      webSocketDebuggerUrl,
    });

    await drill.ready();
    await drill.startSession();
  },
  async beforeEach() {
    this.timeout(0); // for debug only
    const testName = getTestName(this.currentTest);
    await drill.startTest(testName);
  },
  async afterEach() {
    this.timeout(0); // for debug only

    let start, end;
    const isSkippedTest = this.currentTest.isPending(); // mocha's oddities
    if (isSkippedTest) {
      end = 0;
      start = 0;
    } else {
      end = Date.now();
      start = end - this.currentTest.duration;
    }
    const result = mapMochaTestToDrillTestResult(this.currentTest);
    const testName = getTestName(this.currentTest);
    await drill.stopTest(testName, result, start, end);
  },
  async afterAll() {
    this.timeout(0); // for debug only
    await drill.stopSession();
    await global.driver.quit();
  },
};

// ---- HELPER FUNCTIONS ---- (format test results data for Drill4J)
function getTestName(currentTest) {
  const testNameSeparator = ' ';
  const parentName = getParentNameChain(currentTest)
    .filter(x => x)
    .reverse()
    .join(testNameSeparator);
  return `${parentName}${testNameSeparator}${currentTest.title}`;
}

function getParentNameChain(currentTest) {
  const res = [];
  let ptr = currentTest.parent;
  res.push(ptr.title);
  while (ptr.parent) {
    ptr = ptr.parent;
    res.push(ptr.title);
  }
  return res;
}

function mapMochaTestToDrillTestResult(test: Runnable): AdminAPI.TestResult {
  if (test.isPassed()) return AdminAPI.TestResult.PASSED;
  if (test.isFailed()) return AdminAPI.TestResult.FAILED;
  if (test.isPending) return AdminAPI.TestResult.SKIPPED;
  return AdminAPI.TestResult.UNKNOWN;
}

// ---- TESTS SETUP ---- (got nothing to do with Drill4J)
export async function mochaGlobalSetup() {
  await startSeleniumServer();
}

export async function mochaGlobalTeardown() {
  await stopSeleniumServer();
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

declare global {
  namespace NodeJS {
    interface Global {
      driver: WebDriver;
    }
  }
}
