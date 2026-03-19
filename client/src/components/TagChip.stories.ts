import type { Meta, StoryObj } from '@storybook/react-vite';
import TagChip from './TagChip';

const meta: Meta<typeof TagChip> = {
  title: 'Components/TagChip',
  component: TagChip,
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'select',
      options: ['tech', 'art', 'business', 'music', 'sports', 'education', 'custom'],
    },
    onRemove: { action: 'removed' },
  },
};

export default meta;
type Story = StoryObj<typeof TagChip>;

export const Tech: Story = {
  args: { name: 'tech' },
};

export const Art: Story = {
  args: { name: 'art' },
};

export const Business: Story = {
  args: { name: 'business' },
};

export const Music: Story = {
  args: { name: 'music' },
};

export const Sports: Story = {
  args: { name: 'sports' },
};

export const Education: Story = {
  args: { name: 'education' },
};

export const CustomTag: Story = {
  args: { name: 'custom' },
};

export const WithRemoveButton: Story = {
  args: { name: 'tech', onRemove: undefined },
};
