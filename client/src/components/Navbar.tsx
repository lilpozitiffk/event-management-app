import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Calendar, PlusCircle, List } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/events" className="text-xl font-bold text-gray-800">
              EventApp
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/events" className="flex items-center text-gray-600 hover:text-primary">
                  <List className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Events</span>
                </Link>
                <Link to="/my-events" className="flex items-center text-gray-600 hover:text-primary">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">My Events</span>
                </Link>
                <Link to="/create-event" className="flex items-center bg-primary text-white px-3 py-2 rounded-md hover:bg-indigo-700">
                  <PlusCircle className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Create Event</span>
                </Link>
                <div className="flex items-center ml-4 border-l pl-4 border-gray-300">
                  <span className="text-gray-700 mr-3">{user.name}</span>
                  <button onClick={handleLogout} className="text-gray-500 hover:text-danger">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <Link to="/login" className="text-primary hover:text-indigo-700">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
