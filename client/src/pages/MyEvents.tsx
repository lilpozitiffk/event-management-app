import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsApi, Event } from '../services/events.service';
import { Calendar, Clock, MapPin, Users, LayoutList, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import TagChip from '../components/TagChip';

const tagCalendarColors: Record<string, string> = {
  tech: 'bg-blue-500',
  art: 'bg-purple-500',
  business: 'bg-green-500',
  music: 'bg-pink-500',
  sports: 'bg-orange-500',
  education: 'bg-yellow-500',
};

const getEventColor = (event: Event): string => {
  const firstTag = event.tags?.[0]?.name?.toLowerCase();
  return firstTag ? (tagCalendarColors[firstTag] || 'bg-indigo-600') : 'bg-indigo-600';
};

type ViewMode = 'list' | 'calendar';
type CalendarMode = 'month' | 'week';

export default function MyEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyEvents();
  }, [currentPage]);

  useEffect(() => {
    fetchAllEventsForCalendar();
  }, []);

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      const response = await eventsApi.getMyEvents(currentPage, 12);
      setEvents(response.data);
      setTotalPages(response.meta.totalPages);
      setError('');
    } catch (error) {
      setError('Failed to load your events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllEventsForCalendar = async () => {
    const all: Event[] = [];
    let page = 1;
    let pages = 1;
    do {
      const response = await eventsApi.getMyEvents(page, 100);
      all.push(...response.data);
      pages = response.meta.totalPages;
      page++;
    } while (page <= pages);
    setAllEvents(all);
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getDateKey = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = getDateKey(date);
    return allEvents.filter((event) => event.date === dateStr);
  };

  const getWeekStart = (date: Date) => {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    result.setDate(result.getDate() - result.getDay());
    return result;
  };

  const getWeekDays = (date: Date) => {
    const start = getWeekStart(date);
    return Array.from({ length: 7 }).map((_, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      return day;
    });
  };

  const getTimeRange = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return time;
    }

    const start = new Date();
    start.setHours(hours, minutes, 0, 0);

    const end = new Date(start);
    end.setHours(end.getHours() + 1);

    const format = (date: Date) =>
      `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

    return `${format(start)} - ${format(end)}`;
  };

  const prevPeriod = () => {
    if (calendarMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
      return;
    }
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 7);
    setCurrentDate(prev);
  };

  const nextPeriod = () => {
    if (calendarMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
      return;
    }
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 7);
    setCurrentDate(next);
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

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchMyEvents} className="ml-4 text-sm font-medium text-red-700 underline hover:text-red-800">
            Retry
          </button>
        </div>
      )}

      {events.length === 0 && allEvents.length === 0 && !error ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            You are not part of any events yet
          </h2>
          <p className="text-gray-500 mb-6">Explore public events and join.</p>
          <button
            onClick={() => navigate('/events')}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Browse Events
          </button>
        </div>
      ) : viewMode === 'list' ? (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              onClick={() => navigate(`/events/${event.id}`)}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition cursor-pointer flex flex-col"
            >
              {event.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {event.tags.map(tag => (
                    <TagChip key={tag.id} name={tag.name} />
                  ))}
                </div>
              )}
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
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setCalendarMode('month')}
                className={`px-4 py-2 rounded-lg transition ${
                  calendarMode === 'month'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setCalendarMode('week')}
                className={`px-4 py-2 rounded-lg transition ${
                  calendarMode === 'week'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Week
              </button>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-2">
              <button
                onClick={prevPeriod}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Previous
              </button>
              <h2 className="text-base md:text-xl font-bold text-gray-900 min-w-52 text-center">
                {calendarMode === 'month'
                  ? currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })
                  : `${getWeekDays(currentDate)[0].toLocaleDateString()} - ${getWeekDays(currentDate)[6].toLocaleDateString()}`}
              </h2>
              <button
                onClick={nextPeriod}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Next
              </button>
            </div>
          </div>

          {calendarMode === 'month' ? (
            <div className="grid grid-cols-7 gap-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
              {Array.from({
                length: getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth()),
              }).map((_, i) => (
                <div key={`empty-${i}`} className="p-2" />
              ))}
              {Array.from({ length: getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth()) }).map((_, i) => {
                const day = i + 1;
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                const dayEvents = getEventsForDate(date);

                return (
                  <div
                    key={day}
                    className={`p-2 min-h-28 border rounded-lg ${
                      dayEvents.length > 0 ? 'bg-indigo-50 border-indigo-200' : 'bg-white'
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-700 mb-1">{day}</div>
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        onClick={() => navigate(`/events/${event.id}`)}
                        className={`text-xs ${getEventColor(event)} text-white px-2 py-1 rounded mb-1 cursor-pointer`}
                      >
                        <div className="truncate">{event.title}</div>
                        <div className="opacity-90">{getTimeRange(event.time)}</div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="grid grid-cols-7 gap-2 min-w-[760px]">
                {getWeekDays(currentDate).map((day) => {
                  const dayEvents = getEventsForDate(day);
                  return (
                    <div
                      key={day.toISOString()}
                      className={`p-3 min-h-56 border rounded-lg ${
                        dayEvents.length > 0 ? 'bg-indigo-50 border-indigo-200' : 'bg-white'
                      }`}
                    >
                      <div className="text-xs text-gray-500 mb-1">
                        {day.toLocaleDateString('default', { weekday: 'short' })}
                      </div>
                      <div className="text-sm font-semibold text-gray-800 mb-3">
                        {day.getDate()}
                      </div>
                      <div className="space-y-2">
                        {dayEvents.map((event) => (
                          <div
                            key={event.id}
                            onClick={() => navigate(`/events/${event.id}`)}
                            className={`text-xs ${getEventColor(event)} text-white px-2 py-2 rounded cursor-pointer`}
                          >
                            <div className="font-medium truncate">{event.title}</div>
                            <div className="opacity-90 mt-0.5">{getTimeRange(event.time)}</div>
                          </div>
                        ))}
                        {dayEvents.length === 0 && (
                          <div className="text-xs text-gray-400">No events</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
