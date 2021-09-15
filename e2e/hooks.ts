import { Builder, Capabilities, WebDriver } from 'selenium-webdriver';
import { exec } from 'child_process';
import os from 'os';
import axios from 'axios';
import createDrillAutoTestAgent, { AutotestAgent } from '@drill4j/js-auto-test-agent';

let cdpSessionId;
let drillBackend: AutotestAgent;

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

    //--------------------------------- 3
    cdpSessionId = (await axios.post(`${process.env.CHROMESTICK_URL}/sessions`, { host: process.env.CDP_HOST, port: process.env.CDP_PORT }))
      .data;
    await axios.post(`${process.env.CHROMESTICK_URL}/sessions/${cdpSessionId}/profiler/enable`);
    await axios.post(`${process.env.CHROMESTICK_URL}/sessions/${cdpSessionId}/profiler/start-precise-coverage`, {
      callCount: false,
      detailed: true,
    });

    drillBackend = await createDrillAutoTestAgent({
      adminUrl: process.env.ADMIN_URL,
      agentId: process.env.AGENT_ID,
    });
  },
  async afterEach() {
    const endTs = Date.now();
    //--------------------------------- 4
    const res = await axios.post(`${process.env.CHROMESTICK_URL}/sessions/${cdpSessionId}/profiler/take-precise-coverage`);
    const coverage = res.data?.result;
    const testName = getTestName(this.currentTest);
    await drillBackend.addJsCoverage({ coverage, testName });
    const { state, duration } = this.currentTest; // TODO , wallClockStartedAt is missing?
    drillBackend.addTest(testName, convertTestState(state) as any, endTs - duration, duration);
  },
  // runs FOR EVERY FILE in parallel mode, and ONCE in serial mode
  async afterAll() {
    await axios.post(`${process.env.CHROMESTICK_URL}/sessions/${cdpSessionId}/profiler/stop-precise-coverage`);
    await axios.post(`${process.env.CHROMESTICK_URL}/sessions/${cdpSessionId}/profiler/disable`);
    await drillBackend.finish();

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
    //--------------------------------- 2
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

/**
 * Converts Cypress test status to Drill4J test status
 *
 * [reference](https://docs.cypress.io/guides/core-concepts/writing-and-organizing-tests#Test-statuses)
 *
 * TBD: afterEach is not called for skipped & pending tests, might as well omit these?
 * TBD: UNKNOWN status
 */
function convertTestState(state) {
  switch (state) {
    case 'passed':
      return 'PASSED';
    case 'failed':
      return 'FAILED';
    case 'pending':
      return 'SKIPPED';
    case 'skipped':
      return 'SKIPPED';
    default:
      return 'UNKNOWN';
  }
}

function getTestName(currentTest) {
  // Cypress assumes test name separator to be ' '
  // one might change it to the desired character
  // e.g. to display "better" names in Drill4J Admin Panel
  // but then it __have__ to be replaced in test2run.sh before feeding test names to cypress-grep
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
