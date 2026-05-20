const fs = require('fs');
const path = require('path');
const {
  templatesDir,
  projectRoot,
  IS_DEBUG,
  updateRootPackageScripts,
  setupReleaseWorkflow
} = require('../utils.cjs');

async function setupProject() {
  console.log('\nSetting up for Project Development...');

  const workflowDestDir = path.join(projectRoot, '.github', 'workflows');
  if (!fs.existsSync(workflowDestDir)) {
    if (!IS_DEBUG) fs.mkdirSync(workflowDestDir, { recursive: true });
  }

  // Copy Deploy Web App workflow
  const deployWorkflowSrc = path.join(templatesDir, 'web-app', '.github', 'workflows', 'deploy-webapp.yml');
  const deployWorkflowDest = path.join(workflowDestDir, 'deploy-webapp.yml');

  if (fs.existsSync(deployWorkflowSrc)) {
    if (IS_DEBUG) {
      console.log(`[DEBUG] Would copy deploy-webapp.yml to ${deployWorkflowDest}`);
    } else {
      fs.copyFileSync(deployWorkflowSrc, deployWorkflowDest);
      console.log('Copied Web App deployment GitHub Actions workflow.');
    }
  }

  // Copy standard CI workflow
  const ciWorkflowSrc = path.join(__dirname, '..', 'workflows', 'ci.yml');
  const ciWorkflowDest = path.join(workflowDestDir, 'ci.yml');

  if (fs.existsSync(ciWorkflowSrc)) {
    if (IS_DEBUG) {
      console.log(`[DEBUG] Would copy ci.yml to ${ciWorkflowDest}`);
    } else {
      fs.copyFileSync(ciWorkflowSrc, ciWorkflowDest);
      console.log('Copied standard CI GitHub Actions workflow.');
    }
  }

  // Copy standard release workflow
  await setupReleaseWorkflow();

  // Ensure root build script can handle workspaces, building workspaces FIRST
  updateRootPackageScripts({
    "build": "vue-tsc --noEmit && vite build"
  });

  console.log('Project setup complete.');
}

module.exports = setupProject;