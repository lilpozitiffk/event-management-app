import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { createEventSchema, CreateEventFormValues } from '../schemas/event.schema';
import { eventsApi } from '../services/events.service';
import TagMultiSelect from '../components/TagMultiSelect';

export default function CreateEvent() {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(createEventSchema),
    mode: 'onTouched',
    defaultValues: {
      isPublic: true,
    },
  });

  const onSubmit = async (data: CreateEventFormValues) => {
    setSubmitError('');
    try {
      const payload = {
        ...data,
        description: data.description?.trim() || 'No description provided',
        capacity: Number.isNaN(data.capacity as number) || data.capacity === undefined ? null : data.capacity,
        isPublic: data.isPublic === true,
        tagIds: selectedTagIds,
      };
      const createdEvent = await eventsApi.create(payload);
      navigate(`/events/${createdEvent.id}`);
    } catch (error: unknown) {
      const axiosErr = error as { response?: { data?: { message?: string; details?: Record<string, string> } } };
      const details = axiosErr.response?.data?.details;
      if (details && typeof details === 'object') {
        const firstError = Object.values(details)[0];
        setSubmitError(String(firstError));
      } else {
        setSubmitError(axiosErr.response?.data?.message || 'Failed to create event');
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Create New Event</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col">
          <label htmlFor="title" className="mb-1 font-medium text-gray-700">Event Title *</label>
          <input
            id="title"
            type="text"
            {...register('title')}
            className={`border rounded p-2 focus:outline-none focus:ring-2 ${errors.title ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`}
          />
          {errors.title && <span className="text-red-500 text-sm mt-1">{errors.title?.message}</span>}
        </div>

        <div className="flex flex-col">
          <label htmlFor="description" className="mb-1 font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            rows={4}
            {...register('description')}
            className={`border rounded p-2 focus:outline-none focus:ring-2 ${errors.description ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`}
          />
          {errors.description && <span className="text-red-500 text-sm mt-1">{errors.description?.message}</span>}
        </div>

        <div className="flex flex-col">
          <label htmlFor="date" className="mb-1 font-medium text-gray-700">Date *</label>
          <input
            id="date"
            type="date"
            min={new Date().toISOString().split('T')[0]}
            {...register('date')}
            className={`border rounded p-2 focus:outline-none focus:ring-2 ${errors.date ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`}
          />
          {errors.date && <span className="text-red-500 text-sm mt-1">{errors.date?.message}</span>}
        </div>

        <div className="flex flex-col">
          <label htmlFor="time" className="mb-1 font-medium text-gray-700">Time *</label>
          <input
            id="time"
            type="time"
            {...register('time')}
            className={`border rounded p-2 focus:outline-none focus:ring-2 ${errors.time ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`}
          />
          {errors.time && <span className="text-red-500 text-sm mt-1">{errors.time?.message}</span>}
        </div>

        <div className="flex flex-col">
          <label htmlFor="location" className="mb-1 font-medium text-gray-700">Location *</label>
          <input
            id="location"
            type="text"
            {...register('location')}
            className={`border rounded p-2 focus:outline-none focus:ring-2 ${errors.location ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`}
          />
          {errors.location && <span className="text-red-500 text-sm mt-1">{errors.location?.message}</span>}
        </div>

        <div className="flex flex-col">
          <label htmlFor="capacity" className="mb-1 font-medium text-gray-700">Capacity (Optional)</label>
          <input
            id="capacity"
            type="number"
            min="1"
            {...register('capacity', { valueAsNumber: true })}
            placeholder="Leave empty for unlimited"
            className={`border rounded p-2 focus:outline-none focus:ring-2 ${errors.capacity ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`}
          />
          {errors.capacity && <span className="text-red-500 text-sm mt-1">{errors.capacity?.message}</span>}
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Visibility</label>
          <div className="flex gap-4">
            <label className="inline-flex items-center gap-2 text-gray-700">
              <input type="radio" value="true" {...register('isPublic')} />
              Public
            </label>
            <label className="inline-flex items-center gap-2 text-gray-700">
              <input type="radio" value="false" {...register('isPublic')} />
              Private
            </label>
          </div>
          {errors.isPublic && <span className="text-red-500 text-sm mt-1">{errors.isPublic?.message}</span>}
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Tags (optional)</label>
          <TagMultiSelect value={selectedTagIds} onChange={setSelectedTagIds} />
        </div>

        {submitError && (
          <div className="rounded-md bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
            {submitError}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white font-bold py-2 px-4 rounded mt-4 hover:bg-blue-700 transition disabled:opacity-50"
        >
          {isSubmitting ? 'Creating...' : 'Create Event'}
        </button>
      </form>
    </div>
  );
}
