import { Builder, Capabilities, WebDriver } from 'selenium-webdriver';
import { Drill } from '@drill4j/js-auto-test-agent';
import axios from 'axios';
import { executeCommand } from './util';
import { formatTestDetails, formatTestResult } from './drill-format-helpers';

let drill: Drill;
let currentTestDetails: any; // FIXME type it (import from @drill4j/js-auto-test-agent)

export const mochaHooks = {
  async beforeAll() {
    this.timeout(0); // for debug only

    const chromeCapabilities = Capabilities.chrome();
    chromeCapabilities.set('chromeOptions', {
      args: [
        '--headless',
        // important to Drill4J, instructs Chrome to expose DevTools API
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

      // Your application's url
      targetHost: process.env.APP_URL,

      webSocketDebuggerUrl,

      // Agent's ID
      agentId: process.env.AGENT_ID,

      // Add params below if running multiple agents in a group
      // groupId: process.env.GROUP_ID, // instead of "agentId"
      // injectDrillDataToHeaders: true,
    });

    await drill.ready();
    // 'e2e' is an arbitrary string
    // used to distinguish between other types of tests employed on the project
    // see run-tests.sh
    await drill.startSession('e2e');
  },
  async beforeEach() {
    this.timeout(0); // for debug only
    currentTestDetails = formatTestDetails(this.currentTest);
    await drill.startTest(currentTestDetails);
  },
  async afterEach() {
    this.timeout(0); // for debug only
    const { result, start, end } = formatTestResult(this.currentTest);
    await drill.stopTest(currentTestDetails, result, start, end);
  },
  async afterAll() {
    this.timeout(0); // for debug only
    await drill.stopSession();
    await global.driver.quit();
  },
};

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
