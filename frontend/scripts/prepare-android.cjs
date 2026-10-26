const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const frontend = path.resolve(__dirname, '..');
const limiter = path.join(frontend, 'node_modules/.cache/android-build-limit.cjs');
fs.mkdirSync(path.dirname(limiter), { recursive: true });
fs.writeFileSync(limiter, "const os=require('node:os'); const cpus=os.cpus; os.cpus=()=>cpus().slice(0,2);\n");
const api = process.env.CIRCUIT_STREAM_API_URL || 'https://f1-dashboard-adith-b0402b8d99a3.herokuapp.com';
if (new URL(api).protocol !== 'https:') throw new Error('Android builds require an HTTPS backend.');
// Calling react-scripts directly avoids shell interpolation; lint runs separately below.
const env = { ...process.env, CI: 'true', GENERATE_SOURCEMAP: 'false', REACT_APP_API_URL: api,
  NODE_OPTIONS: `--max-old-space-size=4096 --require="${limiter.replaceAll('\\', '/')}"` };
for (const [script, args] of [
  ['eslint/bin/eslint.js', ['src', '--ext', '.js', '--no-cache']],
  ['react-scripts/bin/react-scripts.js', ['build']],
]) {
  const result = spawnSync(process.execPath, [path.join(path.dirname(require.resolve(script.split('/')[0] + '/package.json')), ...script.split('/').slice(1)), ...args], { cwd: frontend, env, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}
const generated = path.resolve(frontend, 'android/app/build/generated/webAssets/public');
if (path.relative(frontend, generated) !== path.join('android', 'app', 'build', 'generated', 'webAssets', 'public')) {
  throw new Error('Unexpected Android assets destination');
}
fs.rmSync(generated, { recursive: true, force: true });
fs.mkdirSync(generated, { recursive: true });
fs.cpSync(path.join(frontend, 'build'), generated, { recursive: true, filter: source => !source.endsWith('.map') });
const index = path.join(generated, 'index.html');
fs.writeFileSync(index, fs.readFileSync(index, 'utf8').replace('<html lang="en">', '<html lang="en" data-platform="android">'));
fs.writeFileSync(path.join(generated, 'android-build.json'), JSON.stringify({ version: '2.0.0', api, runtime: 'Kotlin WebView' }, null, 2));
console.log('Android v2.0.0 assets prepared:', generated);
