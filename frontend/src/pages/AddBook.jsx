import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';

const AddBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    total_copies: 1,
    available_copies: 1,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const fetchBook = async () => {
        try {
          const res = await api.get(`/book/${id}`);
          const bookData = res.data.data || res.data;
          setFormData({
            title: bookData.title,
            author: bookData.author,
            total_copies: bookData.total_copies,
            available_copies: bookData.available_copies,
          });
        } catch {   
          setError('Failed to load book');
        }
      };
      fetchBook();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEdit) {
        await api.put(`/book/${id}`, formData);
      } else {
        await api.post('/book', formData);
      }
      navigate('/books');
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <Link to={isEdit ? `/books/${id}` : '/books'} className="btn btn-ghost" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
        <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 18, height: 18 }}>
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
        Back
      </Link>

      <div className="auth-card" style={{ maxWidth: '500px' }}>
        <div className="auth-header">
          <div className="logo">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
            </svg>
          </div>
          <h1>{isEdit ? 'Edit Book' : 'Add New Book'}</h1>
          <p>{isEdit ? 'Update book details' : 'Add a book to the library'}</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              name="title"
              placeholder="Enter book title"
              value={formData.title}
              onChange={handleChange}
              required
              minLength={2}
              maxLength={30}
            />
          </div>

          <div className="form-group">
            <label>Author</label>
            <input
              type="text"
              name="author"
              placeholder="Enter author name"
              value={formData.author}
              onChange={handleChange}
              required
              minLength={2}
              maxLength={30}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Total Copies</label>
              <input
                type="number"
                name="total_copies"
                value={formData.total_copies}
                onChange={handleChange}
                required
                min={1}
                max={30}
              />
            </div>

            <div className="form-group">
              <label>Available Copies</label>
              <input
                type="number"
                name="available_copies"
                value={formData.available_copies}
                onChange={handleChange}
                required
                min={1}
                max={30}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update Book' : 'Add Book'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBook;
