const axios = require('axios');
const os = require('os');
const { exec } = require('child_process');

const testType = 'e2e'; // same to the value passed to drill.startSession(...); in e2e/hooks.ts
const mochaPath = './node_modules/.bin/mocha';
const testsDir = './e2e';
const drillAdminUrl = 'http://host.docker.internal:8090';
const agentId = 'todomvc-typescript-angular';

(async function () {
  let runString;

  try {
    console.log('Getting tests2run recommendations from Drill4J...');

    // change in case of using service groups             /groups/${groupId}
    const response = await axios.get(`${process.env.DRILL4J_ADMIN_BACKEND_URL ||drillAdminUrl}/api/agents/${agentId}/plugins/test2code/data/tests-to-run`);

    const tests2run = response?.data?.byType?.[testType];
    if (Array.isArray(tests2run) && tests2run.length > 0) {
      const specPaths = tests2run
        .map(x => x.details.metadata.file)
        .unique()
        .map(x => `${testsDir}${x}`)
        .join(' ');

      const testNamesRegex = tests2run
        .map(x => x.details.testName)
        .map(escapeRegex)
        .join('|');

      runString = `${mochaPath} ${specPaths} --grep "${testNamesRegex}"`;
    } else {
      console.log('No test recommendations. Running all tests');
      runString = `${mochaPath} ${testsDir}/specs/**/*.spec.ts`;
    }
  } catch (e) {
    console.log('Failed to get test recommendations. Error:', formatErrorMessage(e), '\nTests will be executed with default params');
  }

  await executeCommand(runString);
})();

// UTIL
function formatErrorMessage(e, prefix) {
  let errText;
  if (e?.isAxiosError && e.response?.data?.message) {
    errText = e.response?.data?.message;
  } else if (e?.message) {
    errText = e.message;
  } else {
    errText = stringify(e);
  }
  return `${prefix}: ${errText}`;
}

Array.prototype.unique = function () {
  return Array.from(new Set(this));
};

function escapeRegex(string) {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

async function executeCommand(cmd) {
  console.log('\x1b[33m%s\x1b[0m', cmd); // print cmd in yellow
  const options = {};
  if (os.platform() === 'win32') {
    options.shell = 'bash';
  }
  return new Promise((resolve, reject) => {
    const child = exec(cmd, options, err => {
      if (err) {
        reject(err);
        return;
      }
      resolve(null);
    });
    const log = x => console.log(x);
    child.stdout.on('data', log);
    child.stderr.on('data', log);
  });
}
