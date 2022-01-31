import upath from 'upath';
import { Runnable } from 'mocha';
import { AdminAPI } from '@drill4j/js-auto-test-agent';

export function formatTestDetails(test: Runnable) {
  const testName = getTestName(test);
  const testPath = getTestPath(test);

  return {
    testName,
    params: {}, // Pass your test's param here (key-value)
    engine: 'mocha+selenium', // An arbitrary string, set to your liking
    path: testPath,
    // "metadata" is an _arbitrary_ information to identify test case
    // It is merely "attached" to each test and exposed via tests2run API
    // See how ./run-tests.sh utilizes it, to launch only tests which were recommended by Drill4J
    metadata: {
      name: testName,
      file: testPath,
    },
  };
}

export function formatTestResult(test: Runnable) {
  let start, end;
  const isSkippedTest = test.isPending(); // mocha's oddities
  if (isSkippedTest) {
    end = 0;
    start = 0;
  } else {
    end = Date.now();
    start = end - test.duration;
  }
  const result = mapMochaTestToDrillTestResult(test);
  return { result, start, end };
}

function getTestPath(test: Runnable) {
  const dirname = upath.normalize(__dirname); // upath is used to ensure universal '/' path separator
  const testPath = upath.normalize(test.file);
  return testPath.replace(dirname, ''); // returns spec file path relative to ./e2e directory
}

function getTestName(test: Runnable) {
  const testNameSeparator = ' ';
  const parentName = getParentNameChain(test)
    .filter(x => x)
    .reverse()
    .join(testNameSeparator);
  return `${parentName}${testNameSeparator}${test.title}`;
}

function getParentNameChain(test: Runnable) {
  const res = [];
  let ptr = test.parent;
  res.push(ptr.title);
  while (ptr.parent) {
    ptr = ptr.parent;
    res.push(ptr.title);
  }
  return res;
}

function mapMochaTestToDrillTestResult(test: Runnable): AdminAPI.TestResult {
  if (test.isPassed()) return AdminAPI.TestResult.PASSED;
  if (test.isFailed()) return AdminAPI.TestResult.FAILED;
  if (test.isPending) return AdminAPI.TestResult.SKIPPED;
  return AdminAPI.TestResult.UNKNOWN;
}
