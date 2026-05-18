const fs = require('fs');
const path = require('path');
const {
  templatesDir,
  projectRoot,
  IS_DEBUG,
  copyDirectoryRecursive
} = require('../utils.cjs');

async function setupElectron() {
  console.log('\nSetting up for Electron App...');
  const electronTemplateDir = path.join(templatesDir, 'electron-app');
  copyDirectoryRecursive(
    path.join(electronTemplateDir, 'electron'),
    path.join(projectRoot, 'electron'),
    {},
  );

  const forgeConfigSrc = path.join(electronTemplateDir, 'forge.config.cjs');
  const forgeConfigDest = path.join(projectRoot, 'forge.config.cjs');

  if (IS_DEBUG) {
    console.log(`[DEBUG] Would copy forge.config.cjs to ${forgeConfigDest}`);
  } else {
    fs.copyFileSync(forgeConfigSrc, forgeConfigDest);
  }

  const packageJsonPath = path.join(projectRoot, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      packageJson.main = 'electron/main.js';
      packageJson.scripts = packageJson.scripts || {};
      packageJson.scripts['electron:start'] = 'electron-forge start';
      packageJson.scripts['electron:package'] = 'electron-forge package';
      packageJson.scripts['electron:make'] = 'electron-forge make';

      packageJson.devDependencies = packageJson.devDependencies || {};
      packageJson.devDependencies['electron'] = '^34.0.0';
      packageJson.devDependencies['@electron-forge/cli'] = '^7.4.0';
      packageJson.devDependencies['@electron-forge/maker-deb'] = '^7.4.0';
      packageJson.devDependencies['@electron-forge/maker-rpm'] = '^7.4.0';
      packageJson.devDependencies['@electron-forge/maker-squirrel'] = '^7.4.0';
      packageJson.devDependencies['@electron-forge/maker-zip'] = '^7.4.0';
      packageJson.devDependencies['electron-squirrel-startup'] = '^1.0.0';

      if (IS_DEBUG) {
        console.log(`[DEBUG] Would update package.json with Electron scripts and dependencies`);
      } else {
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log('Updated package.json for Electron.');
      }
    } catch (e) {
      console.error('Failed to update package.json:', e.message);
    }
  }
}

module.exports = setupElectron;