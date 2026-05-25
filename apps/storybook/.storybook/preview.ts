import { setup } from '@storybook/vue3'
import { Icon } from '@iconify/vue'

setup((app) => {
  app.component('UIcon', Icon)
})

export const parameters = {
  actions: {
    argTypesRegex: '^on[A-Z].*',
  },

  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}
