import { Builder, Capabilities, WebDriver } from 'selenium-webdriver';
import { Drill } from '@drill4j/js-auto-test-agent';
import { formatTestDetails, formatTestResult } from './drill-format-helpers';

let drill: Drill;
let currentTestDetails: any; // FIXME type it (import from @drill4j/js-auto-test-agent)

console.log('process.env.DRILL4J_ADMIN_BACKEND_URL', process.env.DRILL4J_ADMIN_BACKEND_URL);

export const mochaHooks = {
  async beforeAll() {
    this.timeout(0); // for debug only

    const capabilities = Capabilities.chrome();

    capabilities.set('chromeOptions', {
      args: [
        '--headless',
        // important to Drill4J, instructs Chrome to expose DevTools API
        '--remote-debugging-port=9222', // matches port in compose.yml file
        '--remote-debugging-address=0.0.0.0',
      ],
    });
    capabilities.set('selenoid:options', {
      enableVNC: true,
      enableVideo: false,
    });

    global.driver = await new Builder()
      .forBrowser('chrome')
      .usingServer(`http://${process.env.SELENIUM_HUB_HOST}:${process.env.SELENIUM_HUB_PORT}/wd/hub`)
      .withCapabilities(capabilities)
      .build();

    const session = await (global.driver as WebDriver).getSession();
    const sessionId = session.getId();

    // Selenoid
    const webSocketDebuggerUrl = `ws://${process.env.SELENIUM_HUB_HOST}:${process.env.SELENIUM_HUB_PORT}/devtools/${sessionId}`;

    // TODO Selenium Standalone
    // TODO look into Selenium Grid example
    // try to use port from this cap value // const seCdp = session.getCapability('se:cdp');
    // and replace "localhost" with "selenium-standalone:*port*"
    // const webSocketDebuggerUrl = `http://${process.env.SELENIUM_HUB_HOST}:9222`; // dumb workaround

    drill = new Drill({
      adminUrl: process.env.DRILL4J_ADMIN_BACKEND_URL,
      devtoolsProxyUrl: process.env.DRILL4J_DEVTOOLS_PROXY_URL,

      // Your application's url
      targetHost: process.env.APP_URL,

      webSocketDebuggerUrl,

      // Agent's ID
      agentId: process.env.DRILL4J_AGENT_ID,

      // Add params below if running multiple agents in a group
      // groupId: process.env.DRILL4J_GROUP_ID, // instead of "agentId"
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
    try {
      await drill.stopSession();
    } catch (e) {
      console.warn('Failed to stop Drill4J session. Reason:', e?.message);
    }
    await global.driver.quit();
  },
};
