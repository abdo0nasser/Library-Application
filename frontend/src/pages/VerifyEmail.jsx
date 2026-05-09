import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const userId = searchParams.get('userId');
  const code = searchParams.get('code');

  useEffect(() => {
    const verify = async () => {
      if (!userId || !code) {
        setError('Invalid verification link');
        setLoading(false);
        return;
      }

      try {
        await api.get(`/auth/verify-email/${userId}?verificationCode=${code}`);
        setMessage('Email verified successfully! You can now login.');
        setTimeout(() => navigate('/login'), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Verification failed');
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [userId, code, navigate]);

  return (
    <div className="success-page">
      <div className="success-card">
        {loading ? (
          <>
            <div className="spinner" style={{ margin: '0 auto 1.5rem' }}></div>
            <h2>Verifying...</h2>
            <p>Please wait while we verify your email.</p>
          </>
        ) : message ? (
          <>
            <div className="success-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
            <h2>Success!</h2>
            <p>{message}</p>
          </>
        ) : (
          <>
            <div className="success-icon" style={{ background: 'linear-gradient(135deg, var(--danger), #dc2626)' }}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            </div>
            <h2>Verification Failed</h2>
            <p>{error}</p>
            <a href="/login" className="btn btn-secondary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
              Back to Login
            </a>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
