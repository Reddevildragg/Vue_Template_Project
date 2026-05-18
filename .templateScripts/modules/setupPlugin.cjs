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

function addPluginToMainTs(pluginName, importName, defaultExport = true) {
  const mainTsPath = path.join(projectRoot, 'src', 'main.ts');
  if (!fs.existsSync(mainTsPath)) return;

  let content = fs.readFileSync(mainTsPath, 'utf-8');

  // If standard plugin or component library, we might use default import
  const importStatement = defaultExport 
    ? `import ${importName} from '${pluginName}'\n`
    : `import { ${importName} } from '${pluginName}'\n`;

  const lastImportIndex = content.lastIndexOf('import ');
  const endOfLastImport = content.indexOf('\n', lastImportIndex);

  content =
    content.slice(0, endOfLastImport + 1) + importStatement + content.slice(endOfLastImport + 1);

  const mountIndex = content.indexOf('app.mount');
  content = content.slice(0, mountIndex) + `app.use(${importName})\n` + content.slice(mountIndex);

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
  let pluginType = await selectOption('What type of package are you creating?', [
    { label: 'Vue Component Library (UI Components)', value: 'component-library' },
    { label: 'Vue App Plugin (Provides app.use() install hook)', value: 'vue-plugin' },
    { label: 'Standard Code/Utils Library (No Vue dependency)', value: 'utils-library' },
    { label: 'Vite Plugin (Build tool extension)', value: 'vite-plugin' },
  ]);

  let templateName = pluginType;

  const newPluginDir = path.join(pluginsDir, pluginName);

  if (fs.existsSync(newPluginDir)) {
    console.log(`Plugin "${pluginName}" already exists.`);
    return;
  }

  console.log(`Creating plugin from template: ${templateName}`);

  const selectedTemplateDir = path.join(templatesDir, templateName);

  if (!fs.existsSync(selectedTemplateDir)) {
    console.error(`Error: Template "${templateName}" not found at ${selectedTemplateDir}`);
    return;
  }

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

  if (pluginType === 'component-library' || pluginType === 'vue-plugin') {
    console.log('');
    const addToMain = await selectOption(
      'Do you want to automatically add this plugin to main.ts using app.use()?',
      [
        { label: 'Yes', value: 'y' },
        { label: 'No', value: 'n' },
      ],
    );
    if (addToMain === 'y') {
      const pascalName = toPascalCase(pluginName);
      if (pluginType === 'vue-plugin') {
        // Vue plugins might export a specific named object or default
        addPluginToMainTs(pluginName, `${pascalName}Plugin`, true);
      } else {
        addPluginToMainTs(pluginName, `${pascalName}Plugin`, true);
      }
    }
  }

  console.log(
    '\n\x1b[32m%s\x1b[0m',
    'Setup complete! Please run `npm install` to link the new workspace.',
  );
}

module.exports = setupPlugin;