import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const baseConfig = {
    plugins: [react()],
    base: '/',
  };

  // Only use mkcert in development
  if (command === 'serve') {
    return {
      ...baseConfig,
      server: {
        https: true,
      },
      plugins: [
        ...baseConfig.plugins,
        mkcert()
      ]
    };
  }

  // Production build configuration
  return {
    ...baseConfig,
    base: '/medium-firehose-ui/',
  };
});
