const path = require('path');
const fs = require('fs');
const {
  templatesDir,
  projectRoot,
  IS_DEBUG,
  copyDirectoryRecursive,
  updateRootPackageScripts
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
  
  const workflowDestDir = path.join(projectRoot, '.github', 'workflows');
  if (!fs.existsSync(workflowDestDir)) {
    if (!IS_DEBUG) fs.mkdirSync(workflowDestDir, { recursive: true });
  }

  // Copy specialized release workflow
  const releaseWorkflowSrc = path.join(extensionTemplateDir, '.github', 'workflows', 'release-extension.yml');
  const releaseWorkflowDest = path.join(workflowDestDir, 'release-extension.yml');

  if (fs.existsSync(releaseWorkflowSrc)) {
    if (IS_DEBUG) {
      console.log(`[DEBUG] Would copy release-extension.yml to ${releaseWorkflowDest}`);
    } else {
      fs.copyFileSync(releaseWorkflowSrc, releaseWorkflowDest);
      console.log('Copied Browser Extension GitHub Actions workflow.');
    }
  }

  // Copy standard CI workflow
  const ciWorkflowSrc = path.join(__dirname, '..', 'workflows', 'ci.yml');
  const ciWorkflowDest = path.join(workflowDestDir, 'ci.yml');

  if (fs.existsSync(ciWorkflowSrc) && !fs.existsSync(ciWorkflowDest)) {
    if (IS_DEBUG) {
      console.log(`[DEBUG] Would copy ci.yml to ${ciWorkflowDest}`);
    } else {
      fs.copyFileSync(ciWorkflowSrc, ciWorkflowDest);
      console.log('Copied standard CI GitHub Actions workflow.');
    }
  }

  // Ensure root build script can handle workspaces and standard builds
  updateRootPackageScripts({
    "build:app": "vue-tsc --noEmit && vite build",
    "build:workspaces": "npm run build --workspaces --if-present",
    "build": "npm run build:workspaces && npm run build:app"
  });

  console.log('Browser Extension files copied.');
}

module.exports = setupBrowserExtension;