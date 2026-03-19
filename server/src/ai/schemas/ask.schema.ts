import * as yup from 'yup';

export const askSchema = yup.object({
  question: yup.string().required('Question is required').max(500, 'Question too long'),
  history: yup.array().of(
    yup.object({
      role: yup.string().oneOf(['user', 'assistant']).required(),
      content: yup.string().required(),
    }),
  ).optional().default([]),
});
