import { defineConfig } from 'dumi';
import path from 'path';

export default defineConfig({
  alias: {
    '@examples': path.resolve('./examples'),
  },
  outputPath: 'docs-dist',
  themeConfig: {
    name: '@formily/test-repo',
  },
});
