const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const pluginsDir = path.join(__dirname, '..', 'plugins');
const templatesDir = path.join(__dirname, 'templates');
const templateScriptsDir = __dirname;
const projectRoot = path.join(__dirname, '..');

function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function selectOption(message, options) {
  return new Promise((resolve) => {
    let selectedIndex = 0;

    // Use bold for the prompt message
    console.log(`\x1b[1m? ${message}\x1b[0m`);
    options.forEach(() => console.log());

    const render = () => {
      process.stdout.write(`\x1B[${options.length}A`);

      options.forEach((opt, idx) => {
        process.stdout.write('\x1B[2K\x1B[G');
        if (idx === selectedIndex) {
          // Cyan pointer and bold text for selected option
          console.log(`  \x1b[36m❯ ${opt.label}\x1b[0m`);
        } else {
          // Dim text for unselected option
          console.log(`    \x1b[2m${opt.label}\x1b[0m`);
        }
      });
    };

    render();

    const onKeypress = (str, key) => {
      if (key.name === 'up') {
        selectedIndex = (selectedIndex > 0) ? selectedIndex - 1 : options.length - 1;
        render();
      } else if (key.name === 'down') {
        selectedIndex = (selectedIndex < options.length - 1) ? selectedIndex + 1 : 0;
        render();
      } else if (key.name === 'return' || key.name === 'enter') {
        cleanup();
        resolve(options[selectedIndex].value);
      } else if (key.name === 'c' && key.ctrl) {
        cleanup();
        process.exit(1);
      }
    };

    const cleanup = () => {
      process.stdin.removeListener('keypress', onKeypress);
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(false);
      }
      process.stdin.pause();
    };

    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }
    process.stdin.resume();
    process.stdin.on('keypress', onKeypress);
  });
}

async function main() {
  console.log('Welcome to the Template Setup Script!\n');

  const answer = await selectOption('Select an option:', [
    { label: 'Setup for Project Development (Main App)', value: '1' },
    { label: 'Setup for Plugin Development', value: '2' },
    { label: 'Setup for Electron App', value: '3' },
    { label: 'Setup for Browser Extension', value: '4' }
  ]);

  if (answer === '1') {
    await setupProject();
  } else if (answer === '2') {
    await setupPlugin();
  } else if (answer === '3') {
    await setupElectron();
  } else if (answer === '4') {
    await setupBrowserExtension();
  }

  // Ask to remove the template scripts directory
  console.log('');
  const removeScripts = await selectOption('Do you want to remove the .templateScripts directory to clean up the project?', [
    { label: 'Yes', value: 'y' },
    { label: 'No', value: 'n' }
  ]);

  if (removeScripts === 'y') {
      console.log('Removing .templateScripts directory...');
      rl.close();

      try {
          fs.rmSync(templateScriptsDir, { recursive: true, force: true });
          console.log('.templateScripts directory removed.');
      } catch (e) {
          console.error('Failed to remove .templateScripts directory:', e.message);
      }
      return; // Exit
  }

  rl.close();
}

async function setupProject() {
  console.log('\nSetting up for Project Development...');
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
  console.log('');
  let pluginType = await selectOption('Is this a Component Library or a Vite Plugin?', [
    { label: 'Component Library', value: 'component-library' },
    { label: 'Vite Plugin', value: 'vite-plugin' }
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
      '{{CAMEL_PLUGIN_NAME}}': toCamelCase(pluginName)
  };

  copyDirectoryRecursive(selectedTemplateDir, newPluginDir, replacements);

  console.log(`Plugin "${pluginName}" created at plugins/${pluginName}`);

  // Automatically update tsconfig.json and vite.config.ts
  updateTsConfig(pluginName);
  updateViteConfig(pluginName);

  if (pluginType === 'component-library') {
      console.log('');
      const addToMain = await selectOption('Do you want to automatically add this plugin to main.ts?', [
        { label: 'Yes', value: 'y' },
        { label: 'No', value: 'n' }
      ]);
      if (addToMain === 'y') {
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

function updateTsConfig(pluginName) {
    const tsConfigPath = path.join(projectRoot, 'tsconfig.json');
    if (fs.existsSync(tsConfigPath)) {
        try {
            const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf-8'));
            if (!tsConfig.compilerOptions) tsConfig.compilerOptions = {};
            if (!tsConfig.compilerOptions.paths) tsConfig.compilerOptions.paths = {};

            const alias = `${pluginName}`;
            // Point to src/index.ts or src folder. Usually folder is fine if resolution set to Node, but here explicitly adding it.
            // Using `src` folder as per user request to point to source.
            tsConfig.compilerOptions.paths[alias] = [`./plugins/${pluginName}/src`];

            fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2));
            console.log(`Updated tsconfig.json with alias: ${alias}`);
        } catch (e) {
            console.error('Failed to update tsconfig.json:', e.message);
        }
    }
}

function updateViteConfig(pluginName) {
    const viteConfigPath = path.join(projectRoot, 'vite.config.ts');
    if (fs.existsSync(viteConfigPath)) {
        try {
            let content = fs.readFileSync(viteConfigPath, 'utf-8');

            // We want to insert the alias into `alias: { ... }`
            // We'll search for `alias: {` and insert after it.
            // This assumes standard formatting.

            const aliasStart = content.indexOf('alias: {');
            if (aliasStart !== -1) {
                const insertPos = aliasStart + 'alias: {'.length;
                const newAlias = `\n      "${pluginName}": path.resolve(__dirname, "./plugins/${pluginName}/src"),`;

                content = content.slice(0, insertPos) + newAlias + content.slice(insertPos);
                fs.writeFileSync(viteConfigPath, content);
                console.log(`Updated vite.config.ts with alias: ${pluginName}`);
            } else {
                console.warn('Could not find "alias: {" in vite.config.ts to inject new alias.');
            }
        } catch (e) {
            console.error('Failed to update vite.config.ts:', e.message);
        }
    }
}

function addPluginToMainTs(pluginName) {
    const mainTsPath = path.join(projectRoot, 'src', 'main.ts');
    let content = fs.readFileSync(mainTsPath, 'utf-8');

    const pascalName = toPascalCase(pluginName) + 'Plugin';

    // Using the alias we just created!
    const importStatement = `import ${pascalName} from '${pluginName}'\n`;

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

async function setupElectron() {
  console.log('\nSetting up for Electron App...');

  const electronTemplateDir = path.join(templatesDir, 'electron-app');

  // Copy electron folder and forge.config.cjs
  copyDirectoryRecursive(path.join(electronTemplateDir, 'electron'), path.join(projectRoot, 'electron'), {});

  const forgeConfigSrc = path.join(electronTemplateDir, 'forge.config.cjs');
  const forgeConfigDest = path.join(projectRoot, 'forge.config.cjs');
  fs.copyFileSync(forgeConfigSrc, forgeConfigDest);

  // Update package.json
  const packageJsonPath = path.join(projectRoot, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      packageJson.main = "electron/main.js";

      // Add scripts
      packageJson.scripts = packageJson.scripts || {};
      packageJson.scripts["electron:start"] = "electron-forge start";
      packageJson.scripts["electron:package"] = "electron-forge package";
      packageJson.scripts["electron:make"] = "electron-forge make";

      // Add devDependencies
      packageJson.devDependencies = packageJson.devDependencies || {};
      packageJson.devDependencies["electron"] = "^34.0.0";
      packageJson.devDependencies["@electron-forge/cli"] = "^7.4.0";
      packageJson.devDependencies["@electron-forge/maker-deb"] = "^7.4.0";
      packageJson.devDependencies["@electron-forge/maker-rpm"] = "^7.4.0";
      packageJson.devDependencies["@electron-forge/maker-squirrel"] = "^7.4.0";
      packageJson.devDependencies["@electron-forge/maker-zip"] = "^7.4.0";
      packageJson.devDependencies["electron-squirrel-startup"] = "^1.0.0";

      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log('Updated package.json for Electron. Run `npm install` to install dependencies.');
    } catch (e) {
      console.error('Failed to update package.json:', e.message);
    }
  }

  console.log('Electron App setup complete. Run `npm run dev` in one terminal and `npm run electron:start` in another.');
}

async function setupBrowserExtension() {
  console.log('\nSetting up for Browser Extension...');

  const extensionTemplateDir = path.join(templatesDir, 'browser-extension');

  // Copy public and src/extension
  copyDirectoryRecursive(path.join(extensionTemplateDir, 'public'), path.join(projectRoot, 'public'), {});
  copyDirectoryRecursive(path.join(extensionTemplateDir, 'src'), path.join(projectRoot, 'src'), {});

  console.log('Browser Extension files copied.');
  console.log('\nIMPORTANT: To build the extension correctly, you need to update your vite.config.ts.');
  console.log('Add the following to the `build.rollupOptions.input` section in vite.config.ts:');
  console.log(`
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          background: resolve(__dirname, 'src/extension/background.js'),
          content: resolve(__dirname, 'src/extension/content-script.js')
        },
        output: {
          entryFileNames: 'assets/[name].js'
        }
      }
    }
  `);
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
