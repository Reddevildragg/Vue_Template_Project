import type { Plugin } from 'vite';

export default function {{CAMEL_PLUGIN_NAME}}(): Plugin {
  return {
    name: 'vite-plugin-{{PLUGIN_NAME}}',
    configResolved(config) {
      console.log('Plugin {{PLUGIN_NAME}} resolved config!', config.command);
    },
    transform(code, id) {
      if (id.endsWith('.ts') || id.endsWith('.tsx')) {
        // Example transform
        return {
          code,
          map: null
        };
      }
    }
  };
}
