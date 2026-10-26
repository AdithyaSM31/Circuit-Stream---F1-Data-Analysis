const { spawnSync } = require('node:child_process');
const path = require('node:path');
const windows = process.platform === 'win32';
const command = windows ? 'gradlew.bat' : './gradlew';
const tasks = process.argv.slice(2);
const allowed = new Set(['assembleDebug', 'assembleRelease', 'bundleRelease', 'testDebugUnitTest', 'lintDebug']);
if (!tasks.length || tasks.some(task => !allowed.has(task))) throw new Error('Unsupported Gradle task');
const result = spawnSync(windows ? process.env.ComSpec || 'cmd.exe' : command,
  windows ? ['/d', '/s', '/c', `${command} ${tasks.join(' ')} --no-daemon`] : [...tasks, '--no-daemon'],
  { cwd: path.resolve(__dirname, '../android'), stdio: 'inherit', env: process.env });
if (result.error) console.error(result.error.message);
process.exit(result.status ?? 1);
