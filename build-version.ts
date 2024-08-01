import { writeFileSync } from 'fs';
import { join } from 'path';
import { Build, BuildVersion } from 'src/app/shared/interfaces/core.interface';

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

const buildVersion: Build = {
  appVersion: require('./package.json')?.version || 'no info',
  currentIteration: currentIteration + 1,
  buildVersion: (`${require('./package.json')?.version}-build.${currentIteration}` as BuildVersion) || 'no info',
};

writeFileSync(BUILD_VERSION_PATH, JSON.stringify(buildVersion, null, 2));
