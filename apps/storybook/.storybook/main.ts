import type { StorybookConfig } from '@storybook/vue3-vite'
import Icons from 'unplugin-icons/vite'
import vue from '@vitejs/plugin-vue'

const config: StorybookConfig = {
  stories: [
    '../stories/**/*.stories.@(js|jsx|ts|tsx|mdx)',
  ],

  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],

  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },

  docs: {
    autodocs: 'tag',
  },

  async viteFinal(config) {
    config.plugins = config.plugins || []

    config.plugins.push(
      vue(),
      Icons({
        autoInstall: true,
      })
    )

    return config
  },
}

export default config
