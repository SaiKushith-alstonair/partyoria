import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Index() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      navigate('/vendor/dashboard');
    } else {
      navigate('/vendor/onboarding');
    }
  }, [navigate]);
  
  return <div>Loading...</div>;
}