import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    age: user?.age || '',
    description: user?.description || '',
  });
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = { ...formData };
      if (password) data.password = password;

      const res = await api.put(`/user/${user.id}`, data);
      updateUser(res.data.data || res.data);
      setSuccess('Profile updated successfully!');
      setPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    
    try {
      await api.delete(`/user/${user.id}`);
      logout();
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleSendVerification = async () => {
    try {
      await api.post('/auth/send-verification');
      alert('Verification email sent! Check your inbox.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send email');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Profile</h1>
      </div>

      {error && (
        <div className="alert alert-error">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          {success}
        </div>
      )}

      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <div className="profile-info">
            <h2>{user?.name}</h2>
            <p>{user?.email}</p>
          </div>
        </div>

        <div className="profile-body">
          <div className="profile-section">
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <span className="badge badge-info">{user?.user_role === 'NORMAL' ? 'USER' : user?.user_role}</span>
              <span className={`badge ${user?.email_verified_at ? 'badge-success' : 'badge-warning'}`}>
                {user?.email_verified_at ? 'Verified' : 'Not Verified'}
              </span>
            </div>

            {!user?.email_verified_at && (
              <button onClick={handleSendVerification} className="btn btn-secondary" style={{ marginBottom: '1.5rem' }}>
                Send Verification Email
              </button>
            )}
          </div>

          <div className="profile-section">
            <h3>Update Profile</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  min={18}
                  max={75}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  maxLength={128}
                />
              </div>

              <div className="form-group">
                <label>New Password (leave blank to keep current)</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>

          <div className="danger-zone">
            <h3>Danger Zone</h3>
            <p style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button onClick={handleDelete} className="btn btn-danger">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
