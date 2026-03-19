import * as yup from 'yup';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^\d{2}:\d{2}$/;

const parseEventDateTime = (date?: string, time?: string): Date | null => {
  if (!date || !time) return null;
  if (!dateRegex.test(date) || !timeRegex.test(time)) return null;
  const parsed = new Date(`${date}T${time}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const createEventSchema = yup.object({
  title: yup
    .string()
    .required('Title is required')
    .min(3, 'Title must be at least 3 characters'),

  description: yup
    .string()
    .optional(),

  date: yup
    .string()
    .required('Date is required')
    .matches(dateRegex, 'Date must be in YYYY-MM-DD format'),

  time: yup
    .string()
    .required('Time is required')
    .matches(timeRegex, 'Time must be in HH:mm format'),

  location: yup
    .string()
    .required('Location is required'),

  capacity: yup
    .number()
    .transform((value, originalValue) => {
      if (Number.isNaN(value)) return null;
      return String(originalValue).trim() === '' ? null : value;
    })
    .nullable()
    .moreThan(0, 'Capacity must be greater than 0'),

  isPublic: yup
    .boolean()
    .default(true),
  tagIds: yup
    .array()
    .of(yup.number().required())
    .max(5, 'Maximum 5 tags')
    .optional(),
}).test('future-datetime', 'Event cannot be in the past', (value) => {
  const eventDate = parseEventDateTime(value?.date, value?.time);
  if (!eventDate) return false;
  return eventDate.getTime() >= Date.now();
}).required();

export type CreateEventFormValues = yup.InferType<typeof createEventSchema>;

export const eventSchema = yup.object({
  title: yup
    .string()
    .required('Title is required')
    .min(3, 'Title must be at least 3 characters'),
  description: yup
    .string()
    .optional(),
  date: yup
    .string()
    .required('Date is required')
    .matches(dateRegex, 'Date must be in YYYY-MM-DD format'),
  time: yup
    .string()
    .required('Time is required')
    .matches(timeRegex, 'Time must be in HH:mm format'),
  location: yup
    .string()
    .required('Location is required'),
  capacity: yup
    .number()
    .transform((value, originalValue) => {
      if (Number.isNaN(value)) return null;
      return String(originalValue).trim() === '' ? null : value;
    })
    .nullable()
    .moreThan(0, 'Capacity must be greater than 0'),
  isPublic: yup
    .boolean()
    .default(true),
  tagIds: yup
    .array()
    .of(yup.number().required())
    .max(5, 'Maximum 5 tags')
    .optional(),
}).test('future-datetime', 'Event cannot be in the past', (value) => {
  const eventDate = parseEventDateTime(value?.date, value?.time);
  if (!eventDate) return false;
  return eventDate.getTime() >= Date.now();
}).required();

export type EventFormData = yup.InferType<typeof eventSchema>;
