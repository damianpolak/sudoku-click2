import { join } from 'path';
import { writeFileSync } from 'fs';
import { Build, BuildVersion } from 'src/app/shared/interfaces/core.interface';

const BUILD_VERSION_PATH = join(__dirname, './src/build-version.json');

const timestampBasedVersion = new Date().getTime() / 1000;
let iterationNumber = 0;

try {
  iterationNumber = (require('./src/build-version.json') as Build)?.iterationNumber || 0;
} catch (e) {
  iterationNumber = 0;
}

const buildVersion: Build = {
  appVersion: require('./package.json')?.version || 'no info',
  iterationNumber: ++iterationNumber,
  compilationNumber: timestampBasedVersion,
  buildVersion:
    (`${require('./package.json')?.version}-build.${iterationNumber}.${timestampBasedVersion}` as BuildVersion) ||
    'no info',
};

writeFileSync(BUILD_VERSION_PATH, JSON.stringify(buildVersion, null, 2));
