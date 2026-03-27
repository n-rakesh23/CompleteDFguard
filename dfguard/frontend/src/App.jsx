import { Routes, Route } from 'react-router-dom';
import Home          from './pages/Home';
import Features      from './pages/Features';
import Pricing       from './pages/Pricing';
import WhyDFGuard    from './pages/WhyDFGuard';
import Login         from './pages/Login';
import Signup        from './pages/Signup';
import Dashboard     from './pages/Dashboard';
import Profile       from './pages/Profile';
import NotFound      from './pages/NotFound';
import ProtectedRoute from './components/layout/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/"          element={<Home />} />
      <Route path="/features"  element={<Features />} />
      <Route path="/why"       element={<WhyDFGuard />} />
      <Route path="/pricing"   element={<Pricing />} />
      <Route path="/login"     element={<Login />} />
      <Route path="/signup"    element={<Signup />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      <Route path="*"          element={<NotFound />} />
    </Routes>
  );
}
