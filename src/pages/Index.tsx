import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import HomePage from './HomePage';
import LoadingSpinner from '@/components/LoadingSpinner';

const Index = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && user) {
      navigate('/dashboard');
    }
  }, [user, isLoaded, navigate]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return <HomePage />;
};

export default Index;