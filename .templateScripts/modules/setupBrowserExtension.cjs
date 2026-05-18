const path = require('path');
const {
  templatesDir,
  projectRoot,
  copyDirectoryRecursive
} = require('../utils.cjs');

async function setupBrowserExtension() {
  console.log('\nSetting up for Browser Extension...');
  const extensionTemplateDir = path.join(templatesDir, 'browser-extension');
  copyDirectoryRecursive(
    path.join(extensionTemplateDir, 'public'),
    path.join(projectRoot, 'public'),
    {},
  );
  copyDirectoryRecursive(path.join(extensionTemplateDir, 'src'), path.join(projectRoot, 'src'), {});
  console.log('Browser Extension files copied.');
}

module.exports = setupBrowserExtension;