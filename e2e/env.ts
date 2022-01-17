const env = {
  APP_URL: 'http://host.docker.internal:3000',
  SELENIUM_HUB_URL: 'http://localhost:4444/wd/hub',
  DEVTOOLS_PROXY_URL: 'http://localhost:8093',
  ADMIN_URL: 'http://localhost:8090',
  AGENT_ID: 'todomvc-typescript-angular',
};

process.env = { ...process.env, ...env };

export {};
