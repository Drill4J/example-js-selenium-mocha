// example hooks
export const mochaHooks = {
  // runs FOR EVERY FILE in parallel mode, and ONCE in serial mode
  async beforeAll() {
    console.log('beforeAll...');
    await sleep(1000);
    console.log('beforeAll done');
  },
  async beforeEach() {
    console.log('beforeEach', this.currentTest.title);
    await sleep(1000);
    console.log('beforeEach done', this.currentTest.title);
  },
  async afterEach() {
    console.log('afterEach', this.currentTest.title);
    await sleep(1000);
    console.log('afterEach done', this.currentTest.title);
  },
  // runs FOR EVERY FILE in parallel mode, and ONCE in serial mode
  async afterAll() {
    console.log('afterAll');
    await sleep(1000);
    console.log('afterAll done');
  },
};

// runs ONLY ONCE both in parallel and serial mode
export async function mochaGlobalSetup() {
  console.log('mochaGlobalSetup...');
  await sleep(2000);
  console.log('mochaGlobalSetup done');
}

// runs ONLY ONCE both in parallel and serial mode
export async function mochaGlobalTeardown() {
  console.log('mochaGlobalTeardown...');
  await sleep(2000);
  console.log('mochaGlobalTeardown done');
}

async function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}
