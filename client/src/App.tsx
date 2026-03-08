import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import EventsList from './pages/EventsList';
import EventDetails from './pages/EventDetails';
import CreateEvent from './pages/CreateEvent';
import MyEvents from './pages/MyEvents';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<EventsList />} />
              <Route path="/events/:id" element={<EventDetails />} />
              <Route path="/create-event" element={<CreateEvent />} />
              <Route path="/my-events" element={<MyEvents />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
