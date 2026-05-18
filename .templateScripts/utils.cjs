const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const pluginsDir = path.join(__dirname, '..', 'plugins');
const templatesDir = path.join(__dirname, 'templates');
const templateScriptsDir = __dirname;
const projectRoot = path.join(__dirname, '..');

// Check for debug flag in command line arguments
const IS_DEBUG = process.argv.includes('--debug');

function askQuestion(query) {
  return new Promise((resolve) => rl.question(query, resolve));
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
        selectedIndex = selectedIndex > 0 ? selectedIndex - 1 : options.length - 1;
        render();
      } else if (key.name === 'down') {
        selectedIndex = selectedIndex < options.length - 1 ? selectedIndex + 1 : 0;
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
    };

    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }
    process.stdin.resume();
    process.stdin.on('keypress', onKeypress);
  });
}

function getBaseName(str) {
  // If scoped package (e.g. @scope/name), take only the 'name' part
  const parts = str.split('/');
  const name = parts[parts.length - 1];
  // Remove @ if it's there (should be handled by split, but just in case)
  return name.replace(/^@/, '');
}

function toPascalCase(str) {
  const base = getBaseName(str);
  return base
    .split(/[-_]/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

function toCamelCase(str) {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function copyDirectoryRecursive(source, target, replacements) {
  if (!fs.existsSync(target)) {
    if (IS_DEBUG) {
      console.log(`[DEBUG] Would create directory: ${target}`);
    } else {
      fs.mkdirSync(target, { recursive: true });
    }
  }

  const entries = fs.readdirSync(source, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(source, entry.name);

    let destName = entry.name;
    if (destName === 'Component.vue' && replacements['{{PASCAL_PLUGIN_NAME}}']) {
      destName = `${replacements['{{PASCAL_PLUGIN_NAME}}']}Component.vue`;
    }

    const destPath = path.join(target, destName);

    if (entry.isDirectory()) {
      copyDirectoryRecursive(srcPath, destPath, replacements);
    } else {
      let content = fs.readFileSync(srcPath, 'utf-8');

      for (const [key, value] of Object.entries(replacements)) {
        content = content.split(key).join(value);
      }

      if (IS_DEBUG) {
        console.log(`[DEBUG] Would write file: ${destPath}`);
      } else {
        fs.writeFileSync(destPath, content);
      }
    }
  }
}

function closeReadline() {
  rl.close();
}

function updateRootPackageScripts(newScripts) {
  const packageJsonPath = path.join(projectRoot, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      packageJson.scripts = packageJson.scripts || {};
      
      let changed = false;
      for (const [key, value] of Object.entries(newScripts)) {
        if (packageJson.scripts[key] !== value) {
          packageJson.scripts[key] = value;
          changed = true;
        }
      }

      if (changed) {
        if (IS_DEBUG) {
          console.log(`[DEBUG] Would update root package.json scripts with:`, newScripts);
        } else {
          fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
          console.log('Updated root package.json scripts.');
        }
      }
    } catch (e) {
      console.error('Failed to update root package.json scripts:', e.message);
    }
  }
}

module.exports = {
  pluginsDir,
  templatesDir,
  templateScriptsDir,
  projectRoot,
  IS_DEBUG,
  askQuestion,
  selectOption,
  closeReadline,
  toPascalCase,
  toCamelCase,
  copyDirectoryRecursive,
  updateRootPackageScripts
};