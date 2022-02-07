import { Builder, Capabilities } from 'selenium-webdriver';
import { Drill } from '@drill4j/js-auto-test-agent';
import axios from 'axios';
import { formatTestDetails, formatTestResult } from './drill-format-helpers';
import { dnsLookup } from './util';

let drill: Drill;
let currentTestDetails: any; // FIXME type it (import from @drill4j/js-auto-test-agent)

console.log('process.env.DRILL4J_ADMIN_BACKEND_URL', process.env.DRILL4J_ADMIN_BACKEND_URL);

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
      .usingServer(`http://${process.env.SELENIUM_HUB_HOST}:${process.env.SELENIUM_HUB_PORT}/wd/hub`)
      .withCapabilities(chromeCapabilities)
      .build();

    const host = await dnsLookup(process.env.SELENIUM_HUB_HOST); // FIXME selenium host matching browser host is just a "lucky" coincidence
    const res = await axios.get(`http://${host}:9222/json/version`);
    const webSocketDebuggerUrl = res.data.webSocketDebuggerUrl;

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
    await global.driver.quit();
    await drill.stopSession();
  },
};
