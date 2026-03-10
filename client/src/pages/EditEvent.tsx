import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { eventsApi } from '../services/events.service';
import { useAuth } from '../context/AuthContext';
import { eventSchema } from '../schemas/event.schema';
import { ArrowLeft } from 'lucide-react';

export default function EditEvent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(eventSchema),
  });

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const data = await eventsApi.getById(Number(id));
      if (data.organizer.id !== user?.id) {
        setError('You are not authorized to edit this event');
        return;
      }
      reset({
        title: data.title,
        description: data.description,
        date: data.date,
        time: data.time,
        location: data.location,
        capacity: data.capacity,
        isPublic: data.isPublic,
      });
      setError('');
    } catch (err: any) {
      setError('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    setError('');
    setSaving(true);
    try {
      const eventData = {
        ...data,
        capacity: data.capacity || null,
      };
      await eventsApi.update(Number(id), eventData);
      navigate(`/events/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update event');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center text-gray-500">Loading event details...</div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(`/events/${id}`)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to event
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(`/events/${id}`)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to event
      </button>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Event</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Event Title</label>
          <input
            {...register('title')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary outline-none"
            placeholder="Event title"
          />
          {errors.title && (
            <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            {...register('description')}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary outline-none"
            placeholder="Event description"
          />
          {errors.description && (
            <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              {...register('date')}
              type="date"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary outline-none"
            />
            {errors.date && (
              <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
            <input
              {...register('time')}
              type="time"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary outline-none"
            />
            {errors.time && (
              <p className="text-red-500 text-xs mt-1">{errors.time.message}</p>
            )}
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <input
            {...register('location')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary outline-none"
            placeholder="Event location"
          />
          {errors.location && (
            <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Capacity (optional)</label>
          <input
            {...register('capacity', { valueAsNumber: true })}
            type="number"
            min="1"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary outline-none"
            placeholder="Leave empty for unlimited"
          />
          {errors.capacity && (
            <p className="text-red-500 text-xs mt-1">{errors.capacity.message}</p>
          )}
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                {...register('isPublic')}
                value="true"
                className="mr-2"
              />
              <span className="text-gray-700">Public</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                {...register('isPublic')}
                value="false"
                className="mr-2"
              />
              <span className="text-gray-700">Private</span>
            </label>
          </div>
          {errors.isPublic && (
            <p className="text-red-500 text-xs mt-1">{errors.isPublic.message}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
