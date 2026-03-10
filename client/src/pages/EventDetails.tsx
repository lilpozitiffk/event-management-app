import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsApi, Event } from '../services/events.service';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, MapPin, Users, Edit, Trash2, ArrowLeft } from 'lucide-react';

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const data = await eventsApi.getById(Number(id));
      setEvent(data);
      setError('');
    } catch (err: any) {
      setError('Failed to load event details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinLeave = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!event) return;
    try {
      setActionLoading(true);
      if (event.isJoined) {
        await eventsApi.leave(event.id);
      } else {
        await eventsApi.join(event.id);
      }
      await fetchEventDetails();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      const eventId = event.id;
      await eventsApi.delete(eventId);
      navigate('/');
    } catch (err: any) {
      alert('Failed to delete event');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center text-gray-500">Loading event details...</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to events
        </button>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Event not found</h2>
          <p className="text-gray-500 mt-2">The event you are looking for does not exist</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button 
        onClick={() => navigate('/')} 
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to events
      </button>

      <div className="flex justify-between items-start mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
        {event.isOrganizer && (
          <div className="flex space-x-2">
            <button 
              onClick={() => navigate(`/events/${event.id}/edit`)}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Edit className="w-4 h-4 mr-2" /> Edit
            </button>
            <button 
              onClick={handleDelete}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center text-gray-600">
            <Calendar className="w-5 h-5 mr-3 text-primary" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="w-5 h-5 mr-3 text-primary" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <MapPin className="w-5 h-5 mr-3 text-primary" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Users className="w-5 h-5 mr-3 text-primary" />
            <span>{event.participantsCount} / {event.capacity || '∞'} participants</span>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <p className="text-gray-600 whitespace-pre-line">{event.description}</p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Organizer</h2>
          <div className="flex items-center text-gray-600">
            <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center mr-3 font-bold">
              {event.organizer.name.charAt(0).toUpperCase()}
            </div>
            <span>{event.organizer.name}</span>
          </div>
        </div>

        {!event.isOrganizer && (
          <button
            onClick={handleJoinLeave}
            disabled={(event.isFull && !event.isJoined) || actionLoading}
            className={`w-full py-3 px-4 rounded-lg font-medium transition ${
              event.isFull && !event.isJoined
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : event.isJoined
                ? 'bg-white border border-red-500 text-red-500 hover:bg-red-50'
                : 'bg-green-600 text-white hover:bg-green-700'
            } disabled:opacity-50`}
          >
            {actionLoading 
              ? 'Processing...' 
              : event.isFull && !event.isJoined
              ? 'Event is Full'
              : event.isJoined
              ? 'Leave Event'
              : 'Join Event'}
          </button>
        )}

        {event.isOrganizer && (
          <div className="w-full py-3 px-4 rounded-lg bg-gray-100 text-gray-500 text-center font-medium">
            You are the organizer
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold mb-4">
          Participants ({event.participantsCount})
        </h2>
        {event.participants && event.participants.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {event.participants.map((p: { id: number; name: string }) => (
              <div key={p.id} className="flex items-center text-gray-700">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <span>{p.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No participants yet. Be the first to join!</p>
        )}
      </div>
    </div>
  );
}