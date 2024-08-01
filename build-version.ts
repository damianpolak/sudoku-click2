import { writeFileSync } from 'fs';
import { join } from 'path';

const BUILD_VERSION_PATH = join(__dirname, 'src/build-version.json');

function getTimestampBasedVersion() {
  return new Date().getTime() / 1000;
}

let currentIteration = getTimestampBasedVersion();

try {
  currentIteration = require('./build-version.json')?.currentIteration || getTimestampBasedVersion();
} catch (e) {
  currentIteration = getTimestampBasedVersion();
}

const buildVersion = {
  currentIteration: currentIteration + 1,
  buildVersion: `${require('./package.json')?.version}-build.${currentIteration}`,
};

writeFileSync(BUILD_VERSION_PATH, JSON.stringify(buildVersion, null, 2));
