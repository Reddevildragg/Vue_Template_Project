const fs = require('fs');
const path = require('path');
const {
  pluginsDir,
  templatesDir,
  projectRoot,
  IS_DEBUG,
  askQuestion,
  selectOption,
  toPascalCase,
  toCamelCase,
  copyDirectoryRecursive
} = require('../utils.cjs');

function updateWorkspaces() {
  const packageJsonPath = path.join(projectRoot, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

      if (!packageJson.workspaces) {
        packageJson.workspaces = [];
      }

      const pluginPattern = 'plugins/*';

      if (!packageJson.workspaces.includes(pluginPattern)) {
        packageJson.workspaces.push(pluginPattern);

        if (IS_DEBUG) {
          console.log(`[DEBUG] Would add "${pluginPattern}" to workspaces in package.json`);
        } else {
          fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
          console.log(`Updated package.json workspaces to include plugins.`);
        }
      }
    } catch (e) {
      console.error('Failed to update package.json workspaces:', e.message);
    }
  }
}

function addPluginToMainTs(pluginName) {
  const mainTsPath = path.join(projectRoot, 'src', 'main.ts');
  if (!fs.existsSync(mainTsPath)) return;

  let content = fs.readFileSync(mainTsPath, 'utf-8');

  const pascalName = toPascalCase(pluginName) + 'Plugin';
  const importStatement = `import ${pascalName} from '${pluginName}'\n`;

  const lastImportIndex = content.lastIndexOf('import ');
  const endOfLastImport = content.indexOf('\n', lastImportIndex);

  content =
    content.slice(0, endOfLastImport + 1) + importStatement + content.slice(endOfLastImport + 1);

  const mountIndex = content.indexOf('app.mount');
  content = content.slice(0, mountIndex) + `app.use(${pascalName})\n` + content.slice(mountIndex);

  if (IS_DEBUG) {
    console.log(`[DEBUG] Would update src/main.ts to include plugin: ${pluginName}`);
  } else {
    fs.writeFileSync(mainTsPath, content);
    console.log(`Added ${pluginName} to src/main.ts`);
  }
}

async function setupPlugin() {
  console.log('\nSetting up for Plugin Development...');

  const pluginName = await askQuestion('Enter the name of your new plugin (kebab-case): ');

  if (!pluginName) {
    console.log('Plugin name is required.');
    return;
  }

  // Ask for plugin type
  console.log('');
  let pluginType = await selectOption('Is this a Component Library or a Vite Plugin?', [
    { label: 'Component Library', value: 'component-library' },
    { label: 'Vite Plugin', value: 'vite-plugin' },
  ]);
  let templateName = pluginType;

  const newPluginDir = path.join(pluginsDir, pluginName);

  if (fs.existsSync(newPluginDir)) {
    console.log(`Plugin "${pluginName}" already exists.`);
    return;
  }

  console.log(`Creating plugin from template: ${templateName}`);

  const selectedTemplateDir = path.join(templatesDir, templateName);

  // Variables for replacement
  const replacements = {
    '{{PLUGIN_NAME}}': pluginName,
    '{{PASCAL_PLUGIN_NAME}}': toPascalCase(pluginName),
    '{{CAMEL_PLUGIN_NAME}}': toCamelCase(pluginName),
  };

  copyDirectoryRecursive(selectedTemplateDir, newPluginDir, replacements);

  console.log(`Plugin "${pluginName}" created at plugins/${pluginName}`);

  // Automatically update workspaces in package.json
  updateWorkspaces();

  if (pluginType === 'component-library') {
    console.log('');
    const addToMain = await selectOption(
      'Do you want to automatically add this plugin to main.ts?',
      [
        { label: 'Yes', value: 'y' },
        { label: 'No', value: 'n' },
      ],
    );
    if (addToMain === 'y') {
      addPluginToMainTs(pluginName);
    }
  }

  console.log(
    '\n\x1b[32m%s\x1b[0m',
    'Setup complete! Please run `npm install` to link the new plugin workspace.',
  );
}

module.exports = setupPlugin;