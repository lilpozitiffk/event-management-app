import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsApi, Event } from '../services/events.service';
import { useAuth } from '../context/AuthContext';

export default function EventsList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await eventsApi.getAll();
      setEvents(data);
    } catch (error) {
      console.error('Failed to fetch events', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    
    if (!isAuthenticated || !user) {
      alert('Please login to join events');
      navigate('/login');
      return;
    }

    try {
      await eventsApi.join(id);
      fetchEvents();
    } catch (error: any) {
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        logout();
        navigate('/login');
        return;
      }
      alert(error.response?.data?.message || 'Failed to join event');
    }
  };

  const handleLeave = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    
    if (!isAuthenticated || !user) {
      alert('Please login to leave events');
      navigate('/login');
      return;
    }

    try {
      await eventsApi.leave(id);
      fetchEvents();
    } catch (error: any) {
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        logout();
        navigate('/login');
        return;
      }
      alert(error.response?.data?.message || 'Failed to leave event');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center text-gray-500">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Discover Events</h1>
        <p className="text-gray-500 mt-2">Find and join exciting events happening around you</p>
      </div>

      <div className="mb-8">
        <input
          type="text"
          placeholder="Search events..."
          className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {events.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          No events available yet. Check back later!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              onClick={() => navigate(`/events/${event.id}`)}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition cursor-pointer flex flex-col"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
              <p className="text-gray-500 text-sm mb-4 line-clamp-2">{event.description}</p>

              <div className="space-y-2 text-sm text-gray-600 mb-6 flex-grow">
                <div className="flex items-center">
                  <span className="mr-2">📅</span> {event.date}
                </div>
                <div className="flex items-center">
                  <span className="mr-2">⏰</span> {event.time}
                </div>
                <div className="flex items-center">
                  <span className="mr-2">📍</span> {event.location}
                </div>
                <div className="flex items-center">
                  <span className="mr-2">👥</span>
                  {event.participantsCount} / {event.capacity || '∞'} participants
                </div>
              </div>

              <button
  onClick={(e) =>
    event.isJoined ? handleLeave(e, event.id) : handleJoin(e, event.id)
  }
  disabled={(event.isFull && !event.isJoined) || event.isOrganizer}
  className={`w-full py-2 px-4 rounded-lg font-medium transition ${
    event.isOrganizer
      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
      : event.isFull && !event.isJoined
      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
      : event.isJoined
      ? 'bg-white border border-red-500 text-red-500 hover:bg-red-50'
      : 'bg-green-600 text-white hover:bg-green-700'
  }`}
>
  {event.isOrganizer
    ? 'Organizer'
    : event.isFull && !event.isJoined
    ? 'Full'
    : event.isJoined
    ? 'Leave Event'
    : 'Join Event'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
