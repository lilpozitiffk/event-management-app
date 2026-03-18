import { PipeTransform, Injectable, BadRequestException, ArgumentMetadata } from '@nestjs/common';
import { Schema, ValidationError } from 'yup';

@Injectable()
export class YupValidationPipe implements PipeTransform {
  constructor(private readonly schema: Schema) {}

  async transform(value: any, metadata: ArgumentMetadata) {

    if (metadata.type !== 'body' || !this.schema) {
      return value;
    }

    try {

      const validatedValue = await this.schema.validate(value, { 
        abortEarly: false, 
        stripUnknown: true 
      });
      return validatedValue;
    } catch (error) {
      if (error instanceof ValidationError) {

        const formattedErrors = error.inner.reduce((acc, err) => {
          if (err.path) {
            acc[err.path] = err.message;
          }
          return acc;
        }, {} as Record<string, string>);

        throw new BadRequestException({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Validation failed',
          details: formattedErrors,
        });
      }
      throw new BadRequestException('Validation failed');
    }
  }
}