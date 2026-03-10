import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsApi, Event } from '../services/events.service';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';

export default function MyEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      const data = await eventsApi.getMyEvents();
      setEvents(data);
    } catch (error) {
      console.error('Failed to fetch my events', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center text-gray-500">Loading your events...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">My Events</h1>
      <p className="text-gray-500 mb-8">Events you are participating in or organizing</p>

      {events.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            You are not part of any events yet
          </h2>
          <p className="text-gray-500 mb-6">
            Explore public events and join
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Browse Events
          </button>
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
                  <Calendar className="w-4 h-4 mr-2 text-primary" />
                  {event.date}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-primary" />
                  {event.time}
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-primary" />
                  {event.location}
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-primary" />
                  {event.participantsCount} / {event.capacity || '∞'} participants
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {event.isOrganizer ? 'Organizer' : 'Joined'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}