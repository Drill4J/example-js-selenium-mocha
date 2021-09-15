// import dotenv from 'dotenv';

// dotenv.config();

// console.log('process.env', process.env.APP_URL);

const env = {
  // APP_URL: 'https://todomvc.com/examples/typescript-angular/',
  APP_URL: 'http://host.docker.internal:8080',
  SELENIUM_HUB_URL: 'http://localhost:4444/wd/hub',
  CHROMESTICK_URL: 'http://localhost:8093',
  CDP_HOST: 'localhost',
  CDP_PORT: '9222',
  ADMIN_URL: 'http://localhost:8090',
  AGENT_ID: 'todomvc-typescript-angular',
};

process.env = { ...process.env, ...env };

export {};
