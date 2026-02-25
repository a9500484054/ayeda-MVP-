import type { Meta, StoryObj } from "@storybook/vue3";
import { Button } from "@ayeda/ui-kit";

const meta = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "outline", "ghost"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    disabled: {
      control: "boolean",
    },
  },
  args: {
    variant: "primary",
    size: "md",
    disabled: false,
    default: "Button",
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: "primary",
    default: "Primary Button",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    default: "Secondary Button",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    default: "Outline Button",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
    default: "Ghost Button",
  },
};

export const Small: Story = {
  args: {
    size: "sm",
    default: "Small asdsasafdas",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    default: "Large Button",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    default: "Disabled Button",
  },
};
