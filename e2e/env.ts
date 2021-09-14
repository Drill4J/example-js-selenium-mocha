// import dotenv from 'dotenv';

// dotenv.config();

// console.log('process.env', process.env.APP_URL);

const env = {
  APP_URL: 'https://todomvc.com/examples/typescript-angular/',
  SELENIUM_HUB_URL: 'http://localhost:4444/wd/hub',
  CHROMESTICK_URL: 'http://localhost:8093',
  CDP_HOST: 'localhost',
  CDP_PORT: '9222',
};

process.env = { ...process.env, ...env };

export {};
