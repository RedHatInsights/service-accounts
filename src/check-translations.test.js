const { execFileSync, spawnSync } = require('child_process');
const {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} = require('fs');
const { join, resolve } = require('path');

const root = resolve(__dirname, '..');
const fixturesRoot = join(root, 'node_modules');
let fixture;

beforeEach(() => {
  fixture = mkdtempSync(join(fixturesRoot, '.translations-test-'));
  for (const file of ['package.json', 'src', 'locales', 'scripts']) {
    cpSync(join(root, file), join(fixture, file), { recursive: true });
  }
  symlinkSync(join(root, 'node_modules'), join(fixture, 'node_modules'), 'dir');
  mkdirSync(join(fixture, 'tmp'));
});

afterEach(() => rmSync(fixture, { recursive: true, force: true }));

function runLint() {
  return spawnSync('npm', ['run', 'lint:translations'], {
    cwd: fixture,
    encoding: 'utf8',
    env: {
      ...process.env,
      GIT_CEILING_DIRECTORIES: fixturesRoot,
      TMPDIR: join(fixture, 'tmp'),
    },
  });
}

test('validates an up-to-date catalog without Git metadata', () => {
  const git = spawnSync('git', ['rev-parse', '--git-dir'], {
    cwd: fixture,
    env: { ...process.env, GIT_CEILING_DIRECTORIES: fixturesRoot },
  });
  expect(git.status).not.toBe(0);
  const result = runLint();
  expect(result.stderr).toBe('');
  expect(result.status).toBe(0);
});

test('rejects a stale catalog without overwriting it, even when staged', () => {
  const catalog = join(fixture, 'locales/translation-template.json');
  const stale = '{}\n';
  writeFileSync(catalog, stale);
  execFileSync('git', ['init', '-q'], { cwd: fixture });
  execFileSync('git', ['add', 'locales/translation-template.json'], {
    cwd: fixture,
  });
  const result = runLint();
  expect(result.status).toBe(1);
  expect(result.stderr).toContain('Translation template is stale');
  expect(readFileSync(catalog, 'utf8')).toBe(stale);
});

test('rejects newly added source messages without Git metadata', () => {
  writeFileSync(
    join(fixture, 'src/new-message.ts'),
    "import { defineMessages } from 'react-intl';\ndefineMessages({ test: { id: 'new.test', defaultMessage: 'New message' } });\n"
  );
  const result = runLint();
  expect(result.status).toBe(1);
  expect(result.stderr).toContain('Translation template is stale');
});

test('propagates extraction failures', () => {
  rmSync(join(fixture, 'src'), { recursive: true, force: true });
  const result = runLint();
  expect(result.status).not.toBe(0);
});
