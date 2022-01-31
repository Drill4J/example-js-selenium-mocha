import { exec, ExecOptions, ExecException } from 'child_process';
import os from 'os';

export async function executeCommand(cmd, delay = 100) {
  console.log('\x1b[33m%s\x1b[0m', cmd); // print cmd in yellow
  const options: ExecOptions = {};
  if (os.platform() === 'win32') {
    options.shell = 'bash';
  }
  const data = await new Promise((resolve, reject) => {
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
  await sleep(delay);
  return data;
}

function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}
