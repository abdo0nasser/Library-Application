import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [borrowDays, setBorrowDays] = useState(7);
  const [actionMsg, setActionMsg] = useState('');
  const [msgType, setMsgType] = useState('success');

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await api.get(`/book/${id}`);
        const bookData = res.data.data || res.data;
        setBook(bookData);
      } catch {  
        setError('Book not found');
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      await api.delete(`/book/${id}`);
      navigate('/books');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleBorrow = async () => {
    try {
      await api.post(`/borrow-book/${id}/borrow`, { days_to_return: borrowDays });
      setActionMsg('Book borrowed successfully!');
      setMsgType('success');
      const res = await api.get(`/book/${id}`);
      const bookData = res.data.data || res.data;
      setBook(bookData);
    } catch (err) {
      setActionMsg(err.response?.data?.message || 'Failed to borrow');
      setMsgType('error');
    }
  };

  const handleReturn = async () => { // eslint-disable-line no-unused-vars
    try {
      await api.put(`/borrow-book/${id}/return`, { book_id: parseInt(id) });
      setActionMsg('Book returned successfully!');
      setMsgType('success');
      const res = await api.get(`/book/${id}`);
      const bookData = res.data.data || res.data;
      setBook(bookData);
    } catch (err) {
      setActionMsg(err.response?.data?.message || 'Failed to return');
      setMsgType('error');
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="alert alert-error">{error}</div>
        <Link to="/books" className="btn btn-secondary">Back to Books</Link>
      </div>
    );
  }

  if (!book) return null;

  const userId = user?.id || user?.sub;
  const isOwner = userId && book.user_id && userId === book.user_id;
  const isAdmin = user?.user_role === 'ADMIN';

  const available = book.available_copies ?? 0;
  const total = book.total_copies ?? 0;

  return (
    <div className="page">
      <Link to="/books" className="btn btn-ghost" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
        <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 18, height: 18 }}>
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
        Back to Books
      </Link>

      <div className="book-detail">
        <div className="book-detail-header">
          <h1>{book.title || 'Untitled'}</h1>
          <p className="author">by {book.author || 'Unknown'}</p>
        </div>
        
        <div className="book-detail-body">
          {actionMsg && (
            <div className={`alert alert-${msgType}`}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                {msgType === 'success' 
                  ? <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  : <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                }
              </svg>
              {actionMsg}
            </div>
          )}

          <div className="book-info-grid">
            <div className="book-info-item">
              <div className="value">{available}</div>
              <div className="label">Available</div>
            </div>
            <div className="book-info-item">
              <div className="value">{total}</div>
              <div className="label">Total Copies</div>
            </div>
            <div className="book-info-item">
              <div className="value">{total - available}</div>
              <div className="label">Borrowed</div>
            </div>
          </div>

          {!isOwner && available > 0 && (
            <div className="borrow-section">
              <label>Borrow this book</label>
              <div className="input-group">
                <div className="form-group" style={{ margin: 0, flex: 1 }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Days to return (1-15)</label>
                  <input
                    type="number"
                    value={borrowDays}
                    onChange={(e) => setBorrowDays(parseInt(e.target.value) || 1)}
                    min={1}
                    max={15}
                  />
                </div>
                <button onClick={handleBorrow} className="btn btn-primary">
                  Borrow Book
                </button>
              </div>
            </div>
          )}

          {!isOwner && available === 0 && (
            <div className="alert alert-info">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              This book is currently unavailable
            </div>
          )}

          {(isOwner || isAdmin) && (
            <div className="actions">
              <Link to={`/edit-book/${id}`} className="btn btn-secondary">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
                Edit Book
              </Link>
              <button onClick={handleDelete} className="btn btn-danger">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
                Delete Book
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
