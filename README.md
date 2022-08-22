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

1. Start Drill4J services

    - open [./test-environment/drill4j-services](./test-environment/drill4j-services) in terminal
    - execute `docker-compose up -d`

    > WARNING:
    > - This is not definitive configuration for Drill4J services. Please refer to documentation on <https://drill4j.github.io> and find settings appropriate for your needs
    >
    > - Drill4J services have to be deployed separately from your test project, these files are added here just for example's sake

2. Run TodoMVC app version

    - open [./test-environment/app](./test-environment/app) in terminal
    - execute `docker-compose --env-file build-1.0.0.env up -d`

3. Register application in Drill4j

    - open <http://localhost:8091>
    - click "Add agent" button and follow the steps
    - on `Step 2`, in `Target Host` field enter link to TodoMVC application (http://host.docker.internal:8080, note that [./docker-compose.yml](./docker-compose.yml) has `extra_hosts` property specified in order for that to work on Mac and Linux)

4. Run Selenoid

    - open [./test-environment/selenoid](./test-environment/selenoid) in terminal
    - execute `docker pull selenoid/vnc_chrome:103.0`
    - execute `docker-compose up -d`

5. Launch tests. You can do that by either:

    - using Docker image
      - open [root directory](./) in terminal
      - run `docker-compose up`

    - or locally (Node.js 16.x required)
      - run `npm install`
      - run `npm run test_with_recommendations` (see package.json for details)

6. When tests are completed coverage should be available in Admin UI
      - Navigate to agent's [Test2Code plugin page](http://localhost:8091/agents/todomvc-typescript-angular/plugins/test2code/builds/1.0.0/overview?activeTab=methods)
      - Click "Finish Scope" to save the collected metrics

7. Deploy second app build

    - open [./test-environment/app](./test-environment/app) in terminal
    - execute `docker-compose down`
    - execute `docker-compose --env-file build-2.0.0.env up -d`

8. Launch tests again (see steps above) (_This time, only recommended tests should be executed_)
