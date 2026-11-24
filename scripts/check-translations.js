const { spawnSync } = require('child_process');
const { mkdtempSync, readFileSync, rmSync } = require('fs');
const { tmpdir } = require('os');
const { join } = require('path');

const tempDir = mkdtempSync(join(tmpdir(), 'service-accounts-translations-'));

try {
  const output = join(tempDir, 'translation-template.json');
  const result = spawnSync('npm', ['run', 'translations:extract', '--', '--out-file', output], { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    process.exitCode = result.status || 1;
  } else if (!readFileSync('locales/translation-template.json').equals(readFileSync(output))) {
    console.error('Translation template is stale. Run npm run translations:extract and commit the result.');
    process.exitCode = 1;
  }
} catch (error) {
  console.error('Translation validation failed:', error.message);
  process.exitCode = 1;
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}
