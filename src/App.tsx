
import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import SellPage from './pages/SellPage';
import MyListings from './pages/MyListings';
import AdminPanel from './pages/AdminPanel';
import NotFound from './pages/NotFound';
import ProductionReadiness from './pages/ProductionReadiness';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/sell" element={
          <ProtectedRoute>
            <SellPage />
          </ProtectedRoute>
        } />
        <Route path="/my-listings" element={
          <ProtectedRoute>
            <MyListings />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute adminOnly>
            <AdminPanel />
          </ProtectedRoute>
        } />
        <Route path="/production-readiness" element={
          <ProtectedRoute adminOnly>
            <ProductionReadiness />
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
