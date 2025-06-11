/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Plugins

import type { App } from 'vue';

import { createPinia } from 'pinia';

export function registerPlugins (app: App) {
  const pinia = createPinia();
  app
    .use(pinia);
}
