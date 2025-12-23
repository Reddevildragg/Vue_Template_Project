const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const pluginsDir = path.join(__dirname, '..', 'plugins');
const templatesDir = path.join(__dirname, 'templates');

function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('Welcome to the Template Setup Script!');
  console.log('1. Setup for Project Development (Main App)');
  console.log('2. Setup for Plugin Development');

  const answer = await askQuestion('Select an option (1 or 2): ');

  if (answer.trim() === '1') {
    await setupProject();
  } else if (answer.trim() === '2') {
    await setupPlugin();
  } else {
    console.log('Invalid option.');
  }

  rl.close();
}

async function setupProject() {
  console.log('\nSetting up for Project Development...');

  // Here we could remove the example plugin if desired, or just leave it as reference.
  const removeExample = await askQuestion('Do you want to remove the example plugin? (y/n): ');

  if (removeExample.toLowerCase() === 'y') {
    const examplePluginPath = path.join(pluginsDir, 'example-plugin');
    if (fs.existsSync(examplePluginPath)) {
        fs.rmSync(examplePluginPath, { recursive: true, force: true });
        console.log('Example plugin removed.');

        // Also need to remove import from main.ts
        updateMainTs(false);
    }
  } else {
      console.log('Keeping example plugin.');
  }

  console.log('Project setup complete.');
}

async function setupPlugin() {
  console.log('\nSetting up for Plugin Development...');

  const pluginName = await askQuestion('Enter the name of your new plugin (kebab-case): ');

  if (!pluginName) {
    console.log('Plugin name is required.');
    return;
  }

  // Ask for plugin type
  let pluginType = await askQuestion('Is this a Component Library or a Vite Plugin? (1: Component Library, 2: Vite Plugin): ');
  let templateName = '';

  if (pluginType.trim() === '1') {
      pluginType = 'component-library';
      templateName = 'component-library';
  } else if (pluginType.trim() === '2') {
      pluginType = 'vite-plugin';
      templateName = 'vite-plugin';
  } else {
      console.log('Invalid option. Defaulting to Component Library.');
      pluginType = 'component-library';
      templateName = 'component-library';
  }

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
      '{{CAMEL_PLUGIN_NAME}}': toCamelCase(pluginName)
  };

  copyDirectoryRecursive(selectedTemplateDir, newPluginDir, replacements);

  console.log(`Plugin "${pluginName}" created at plugins/${pluginName}`);

  if (pluginType === 'component-library') {
      const addToMain = await askQuestion('Do you want to automatically add this plugin to main.ts? (y/n): ');
      if (addToMain.toLowerCase() === 'y') {
          addPluginToMainTs(pluginName);
      }
  } else {
      console.log(`To use this vite plugin, import it in your root vite.config.ts.`);
  }
}

function copyDirectoryRecursive(source, target, replacements) {
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
    }

    const entries = fs.readdirSync(source, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(source, entry.name);

        // Handle file name replacements (e.g. Component.vue -> MyPluginComponent.vue)
        let destName = entry.name;
        if (destName === 'Component.vue' && replacements['{{PASCAL_PLUGIN_NAME}}']) {
             destName = `${replacements['{{PASCAL_PLUGIN_NAME}}']}Component.vue`;
        }

        const destPath = path.join(target, destName);

        if (entry.isDirectory()) {
            copyDirectoryRecursive(srcPath, destPath, replacements);
        } else {
            let content = fs.readFileSync(srcPath, 'utf-8');

            // Perform replacements
            for (const [key, value] of Object.entries(replacements)) {
                content = content.split(key).join(value);
            }

            fs.writeFileSync(destPath, content);
        }
    }
}

function updateMainTs(includeExample) {
    const mainTsPath = path.join(__dirname, '..', 'src', 'main.ts');
    let content = fs.readFileSync(mainTsPath, 'utf-8');

    if (!includeExample) {
        // Remove import and comment
        content = content.replace(/\/\/ Import example plugin\n\/\/ In a real scenario, you might dynamic import this or have a configuration file\n/, '');
        content = content.replace(/import ExamplePlugin from '@plugins\/example-plugin'\n/, '');

        // Remove usage and comment
        content = content.replace(/\n\/\/ Use the example plugin\n/, '');
        content = content.replace(/app.use\(ExamplePlugin\)\n/, '');
    }

    fs.writeFileSync(mainTsPath, content);
}

function addPluginToMainTs(pluginName) {
    const mainTsPath = path.join(__dirname, '..', 'src', 'main.ts');
    let content = fs.readFileSync(mainTsPath, 'utf-8');

    const pascalName = toPascalCase(pluginName) + 'Plugin';

    // Importing from src for local dev as discussed
    const importStatement = `import ${pascalName} from '@plugins/${pluginName}/src'\n`;

    // Add import after last import
    const lastImportIndex = content.lastIndexOf('import ');
    const endOfLastImport = content.indexOf('\n', lastImportIndex);

    content = content.slice(0, endOfLastImport + 1) + importStatement + content.slice(endOfLastImport + 1);

    // Add use
    const mountIndex = content.indexOf('app.mount');
    content = content.slice(0, mountIndex) + `app.use(${pascalName})\n` + content.slice(mountIndex);

    fs.writeFileSync(mainTsPath, content);
    console.log(`Added ${pluginName} to src/main.ts`);
}

function toPascalCase(str) {
  return str.replace(/(^\w|-\w)/g, clearAndUpper);
}

function toCamelCase(str) {
    return str.replace(/-./g, x => x[1].toUpperCase());
}

function clearAndUpper(text) {
  return text.replace(/-/, "").toUpperCase();
}

main();
