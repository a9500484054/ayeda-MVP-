import type { Meta, StoryObj } from '@storybook/vue3'
import Button from '../../frontend/app/shared/ui/button/Button.vue'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],

  argTypes: {
    color: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'danger',
        'success',
        'warning',
        'info',
        'neutral',
        'white',
      ],
    },

    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
    },

    variant: {
      control: 'select',
      options: ['solid', 'outline', 'ghost'],
    },

    iconPosition: {
      control: 'select',
      options: ['left', 'right'],
    },

    text: {
      control: 'text',
    },

    icon: {
      control: 'text',
    },

    iconOnly: {
      control: 'boolean',
    },

    block: {
      control: 'boolean',
    },

    loading: {
      control: 'boolean',
    },

    disabled: {
      control: 'boolean',
    },
  },
}

export default meta

type Story = StoryObj<typeof Button>

export const Primary: Story = {
  args: {
    text: 'Primary Button',
    color: 'primary',
    size: 'md',
    variant: 'solid',
  },
}

export const WithIcon: Story = {
  args: {
    text: 'With Star Icon',
    icon: 'lucide:star',
    iconPosition: 'left',
  },
}

export const IconOnly: Story = {
  args: {
    icon: 'lucide:settings',
    iconOnly: true,
    text: '',
  },
}

export const Loading: Story = {
  args: {
    text: 'Loading',
    loading: true,
  },
}

export const Disabled: Story = {
  args: {
    text: 'Disabled',
    disabled: true,
  },
}

export const AllVariants: Story = {
  render: () => ({
    components: { Button },

    template: `
      <div style="display:flex;gap:1rem;flex-wrap:wrap;">
        <Button color="primary" text="Primary" icon="lucide:star" />
        <Button color="secondary" text="Secondary" icon="lucide:heart" />
        <Button color="danger" text="Danger" icon="lucide:trash-2" />
        <Button color="success" text="Success" icon="lucide:check" />
        <Button color="warning" text="Warning" icon="lucide:triangle-alert" />
        <Button color="info" text="Info" icon="lucide:info" />
        <Button color="neutral" text="Neutral" icon="lucide:menu" />
        <Button color="white" text="White" icon="lucide:user" />
      </div>
    `,
  }),
}
