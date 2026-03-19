import type { Meta, StoryObj } from '@storybook/react-vite';
import Button from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'danger', 'outline', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { children: 'Create Event', variant: 'primary' },
};

export const Danger: Story = {
  args: { children: 'Delete Event', variant: 'danger' },
};

export const Outline: Story = {
  args: { children: 'Cancel', variant: 'outline' },
};

export const Ghost: Story = {
  args: { children: 'Back', variant: 'ghost' },
};

export const Small: Story = {
  args: { children: 'Small', variant: 'primary', size: 'sm' },
};

export const Large: Story = {
  args: { children: 'Large Button', variant: 'primary', size: 'lg' },
};

export const Loading: Story = {
  args: { children: 'Save', variant: 'primary', loading: true },
};

export const Disabled: Story = {
  args: { children: 'Disabled', variant: 'primary', disabled: true },
};

export const FullWidth: Story = {
  args: { children: 'Join Event', variant: 'primary', fullWidth: true },
};
