import * as yup from 'yup';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^\d{2}:\d{2}$/;

const parseEventDateTime = (date?: string, time?: string): Date | null => {
  if (!date || !time) return null;
  if (!dateRegex.test(date) || !timeRegex.test(time)) return null;
  const parsed = new Date(`${date}T${time}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const baseEventSchema = {
  title: yup.string().trim().required('Title is required').min(3, 'Title must be at least 3 characters'),
  description: yup.string().trim().optional(),
  date: yup
    .string()
    .required('Date is required')
    .matches(dateRegex, 'Date must be in YYYY-MM-DD format'),
  time: yup
    .string()
    .required('Time is required')
    .matches(timeRegex, 'Time must be in HH:mm format'),
  location: yup.string().trim().required('Location is required'),
  capacity: yup
    .number()
    .transform((value, originalValue) => (String(originalValue).trim() === '' ? null : value))
    .nullable()
    .moreThan(0, 'Capacity must be greater than 0')
    .optional(),
  isPublic: yup.boolean().default(true).optional(),
};

export const createEventSchema = yup
  .object(baseEventSchema)
  .test('future-date', 'Cannot create events in the past', (value) => {
    const eventDate = parseEventDateTime(value?.date, value?.time);
    if (!eventDate) return false;
    return eventDate.getTime() >= Date.now();
  })
  .required();

export const updateEventSchema = yup
  .object({
    title: yup.string().trim().min(3, 'Title must be at least 3 characters').optional(),
    description: yup.string().trim().optional(),
    date: yup.string().matches(dateRegex, 'Date must be in YYYY-MM-DD format').optional(),
    time: yup.string().matches(timeRegex, 'Time must be in HH:mm format').optional(),
    location: yup.string().trim().optional(),
    capacity: yup
      .number()
      .transform((value, originalValue) => (String(originalValue).trim() === '' ? null : value))
      .nullable()
      .moreThan(0, 'Capacity must be greater than 0')
      .optional(),
    isPublic: yup.boolean().optional(),
  })
  .test('future-date', 'Cannot set events in the past', (value) => {
    const eventDate = parseEventDateTime(value?.date, value?.time);
    if (!eventDate) return true;
    return eventDate.getTime() >= Date.now();
  })
  .required();
