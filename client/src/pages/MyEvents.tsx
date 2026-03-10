import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsApi, Event } from '../services/events.service';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, MapPin, Users, LayoutList, CalendarDays } from 'lucide-react';

type ViewMode = 'list' | 'calendar';

export default function MyEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentMonth, setCurrentMonth] = useState(new Date());
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

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getEventsForDay = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Events</h1>
          <p className="text-gray-500">Events you are participating in or organizing</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center px-4 py-2 rounded-lg transition ${
              viewMode === 'list'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <LayoutList className="w-4 h-4 mr-2" />
            List
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center px-4 py-2 rounded-lg transition ${
              viewMode === 'calendar'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <CalendarDays className="w-4 h-4 mr-2" />
            Calendar
          </button>
        </div>
      </div>

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
      ) : viewMode === 'list' ? (
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
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={prevMonth}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Previous
            </button>
            <h2 className="text-xl font-bold text-gray-900">
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={nextMonth}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Next
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
            {Array.from({ length: getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth()) }).map((_, i) => (
              <div key={`empty-${i}`} className="p-2" />
            ))}
            {Array.from({ length: getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth()) }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDay(day);
              return (
                <div
                  key={day}
                  className={`p-2 min-h-24 border rounded-lg ${
                    dayEvents.length > 0 ? 'bg-indigo-50 border-indigo-200' : 'bg-white'
                  }`}
                >
                  <div className="text-sm font-medium text-gray-700 mb-1">{day}</div>
                  {dayEvents.map(event => (
                    <div
                      key={event.id}
                      onClick={() => navigate(`/events/${event.id}`)}
                      className="text-xs bg-primary text-white px-2 py-1 rounded mb-1 cursor-pointer truncate"
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}