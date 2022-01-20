const env = {
  APP_URL: 'http://host.docker.internal:8080',
  SELENIUM_HUB_URL: 'http://host.docker.internal:4444/wd/hub',
  ADMIN_URL: 'http://host.docker.internal:8090',
  DEVTOOLS_PROXY_URL: 'http://host.docker.internal:8093',
  AGENT_ID: 'todomvc-typescript-angular',
};

process.env = { ...process.env, ...env };

export {};
