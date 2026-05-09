import { Link } from 'react-router-dom';

const VerifyPending = () => {
  return (
    <div className="success-page">
      <div className="success-card">
        <div className="success-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
        </div>
        <h2>Verify Your Email</h2>
        <p>Please check your inbox and click the verification link to activate your account.</p>
        <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Didn't receive the email? Check your spam folder or <Link to="/login">go back to login</Link>.
        </p>
      </div>
    </div>
  );
};

export default VerifyPending;
