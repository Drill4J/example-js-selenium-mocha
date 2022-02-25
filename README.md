# Selenium + Mocha + Typescript - TodoMVC

Exemplary integration demonstrating Drill4J integration approach.

Features JavaScript coverage collection for tests executed in headless mode.

## The setup

- [TodoMVC Typescript Angular app](https://github.com/Drill4J/example-js-todomvc/tree/example/examples/typescript-angular) is used as an example;
- Tests are implemented with Selenium-Webdriver & Mocha framework;
- Drill4J integration:
  - Runtime metrics collection is enabled with `@drill4j/js-auto-test-agent` via intergration with Mocha hooks. See [./e2e/hooks.ts](./e2e/hooks.ts) for details
  - Drill4J test recommendations are passed to Mocha with [./run-tests.js](./run-tests.js) script

## Launch

1. Run Drill4J components - Admin Backend, Admin UI, DevTools Proxy, JS agent
    - Compatible versions at the time of writing
    ```ini
      #backend
      BACK_VERSION=0.8.0-46 # Drill4J Admin Backend
      TEST2CODE_PLUGIN_VERSION=0.8.0-48
      DEVTOOLS_PROXY_VERSION=0.1.0-beta.1
      #ui
      FRONT_VERSION=0.1.0-119
      TEST2CODE_UI_VERSION=0.1.0-120
      #js-agent
      JS_AGENT_VERSION=0.3.0-beta.3
      JS_PARSER=0.5.0-beta.0
    ```

2. Run TodoMVC app
    - See [./test-environment/app](./test-environment/app) for example
    - Deploy 2.0.0 only after tests are completed

3. Run Selenoid (however you like, you can take a look at [./test-environment/selenoid](./test-environment/selenoid) or [./test-environment/
selenoid-cm](./test-environment/selenoid-cm))

4. Launch tests. You can do that either:
    - using Docker image
      - check env vars in [`.env`](./.env)
      - run `docker-compose up`
    - or locally (Node.js 16.x required)
      - run `npm install`
      - run `npm run test_with_recommendations` (see package.json for details)

    - When tests are completed coverage should be available in Admin UI
      - Finish active scope 

5. Deploy second build (see steps above)

6. Launch tests again (see steps above) (_Only recommended tests should be executed_)
