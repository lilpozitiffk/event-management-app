import type { Meta, StoryObj } from '@storybook/react-vite';
import Input from './Input';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: { placeholder: 'Enter text...' },
};

export const WithLabel: Story = {
  args: { label: 'Email Address', placeholder: 'john@example.com', type: 'email' },
};

export const WithError: Story = {
  args: { label: 'Password', type: 'password', error: 'Password must be at least 6 characters' },
};

export const DateInput: Story = {
  args: { label: 'Event Date', type: 'date' },
};

export const TimeInput: Story = {
  args: { label: 'Event Time', type: 'time' },
};

export const Disabled: Story = {
  args: { label: 'Disabled Input', placeholder: 'Cannot edit', disabled: true },
};
