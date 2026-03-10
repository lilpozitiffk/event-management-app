import * as yup from 'yup';

export const registerSchema = yup
  .object({
    name: yup
      .string()
      .trim()
      .required('Name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must not exceed 50 characters'),
    email: yup
      .string()
      .trim()
      .required('Email is required')
      .email('Enter a valid email'),
    password: yup
      .string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters'),
  })
  .required();

export const loginSchema = yup
  .object({
    email: yup
      .string()
      .trim()
      .required('Email is required')
      .email('Enter a valid email'),
    password: yup
      .string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters'),
  })
  .required();
