import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const FacebookCallback = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const token = getCookie('accessToken');

      if (token) {
        const payload = parseJwt(token);
        if (payload) {
          await login(token, {
            id: payload.sub,
            email: payload.email,
            user_role: payload.role === 'USER' ? 'NORMAL' : payload.role,
            email_verified_at: payload.isVerified ? new Date() : null,
          });
          navigate('/dashboard');
          return;
        }
      }

      try {
        const res = await api.get('/user/me');
        const userData = res.data.data || res.data;
        await login('cookie-auth', userData);
        navigate('/dashboard');
      } catch {
        setError('Failed to authenticate with Facebook');
      }
    };

    handleCallback();
  }, [login, navigate]);

  if (error) {
    return (
      <div className="success-page">
        <div className="success-card">
          <div className="success-icon" style={{ background: 'linear-gradient(135deg, var(--danger), #dc2626)' }}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </div>
          <h2>Authentication Failed</h2>
          <p>{error}</p>
          <a href="/login" className="btn btn-secondary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
            Back to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="success-page">
      <div className="success-card">
        <div className="success-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <h2>Successfully logged in!</h2>
        <p>Redirecting you to your library...</p>
      </div>
    </div>
  );
};

export default FacebookCallback;
