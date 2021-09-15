import fsExtra from 'fs-extra';
import { Builder, By, Key, Capabilities } from 'selenium-webdriver';
import axios from 'axios';

const TARGET_APP_URL = 'http://todomvc.com/examples/typescript-angular/';
const SELENIUM_HUB_URL = 'http://localhost:4444/wd/hub';
const CHROMESTICK_URL = 'http://localhost:8093';
const CDP_HOST = 'localhost';
const CDP_PORT = '9222';

start();
async function start() {
  try {
    //--------------------------------- 1
    axios.defaults = {
      baseURL: CHROMESTICK_URL,
    };

    const chromeCapabilities = Capabilities.chrome();

    chromeCapabilities.set('chromeOptions', {
      //--------------------------------- 2
      args: ['--headless', `--remote-debugging-port=${CDP_PORT}`, '--remote-debugging-address=0.0.0.0'],
    });

    const driver = await new Builder().forBrowser('chrome').usingServer(SELENIUM_HUB_URL).withCapabilities(chromeCapabilities).build();

    (await driver.getSession()).getId();

    //--------------------------------- 3
    const { data: sessionId } = await axios.post('/sessions', { host: CDP_HOST, port: CDP_PORT });
    await axios.post(`/sessions/${sessionId}/profiler/enable`);
    await axios.post(`/sessions/${sessionId}/profiler/start-precise-coverage`, {
      callCount: false,
      detailed: true,
    });

    // DO TEST STUFF
    await driver.get(TARGET_APP_URL);
    const element = await driver.findElement(By.css('input'));
    await element.sendKeys('new todo', Key.RETURN);

    //--------------------------------- 4
    const { data: coverage } = await axios.post(`/sessions/${sessionId}/profiler/take-precise-coverage`);
    console.log('coverage (scripts number): ', coverage?.length);
    await axios.post(`/sessions/${sessionId}/profiler/stop-precise-coverage`);
    await axios.post(`/sessions/${sessionId}/profiler/disable`);

    await driver.close();

    //--------------------------------- 5
    fsExtra.writeJSONSync(`${Date.now()}-coverage.json`, coverage);
  } catch (e) {
    console.log(e);
  }
}
