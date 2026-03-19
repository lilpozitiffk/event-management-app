import type { Meta, StoryObj } from '@storybook/react-vite';
import Modal from './Modal';
import Button from './Button';

const meta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    title: 'Delete Event',
    children: 'Are you sure you want to delete this event? This action cannot be undone.',
    actions: (
      <>
        <Button variant="outline">Cancel</Button>
        <Button variant="danger">Delete</Button>
      </>
    ),
  },
};

export const Confirmation: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    title: 'Leave Event',
    children: 'Are you sure you want to leave this event?',
    actions: (
      <>
        <Button variant="outline">Cancel</Button>
        <Button variant="primary">Leave</Button>
      </>
    ),
  },
};

export const InfoOnly: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    title: 'Event Full',
    children: 'This event has reached its maximum capacity. Please check back later or contact the organizer.',
    actions: (
      <Button variant="primary">OK</Button>
    ),
  },
};
