import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const MyBorrows = () => {
  const { user } = useAuth();
  const [borrows, setBorrows] = useState([]);
  const [books, setBooks] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const userId = user?.id || user?.sub;

  const fetchBorrows = useCallback(async (pageNum = 1) => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    try {
      const res = await api.get(`/borrow-book/user-history/${userId}`, {
        params: { page: pageNum, limit: 10 },
      });
      
      const data = res.data.data || res.data;
      const metadata = res.data.metadata;
      
      setBorrows(Array.isArray(data) ? data : []);
      if (metadata) {
        setTotalPages(metadata.totalPages || 1);
      }
      setPage(pageNum);
      setError('');
      
      const bookIds = [...new Set((Array.isArray(data) ? data : []).map(b => b.book_id))];
      const bookPromises = bookIds.map(async (id) => {
        try {
          const bookRes = await api.get(`/book/${id}`);
          return { id, book: bookRes.data.data || bookRes.data };
        } catch {
          return { id, book: { id, title: `Book #${id}` } };
        }
      });
      
      const bookResults = await Promise.all(bookPromises);
      const booksMap = {};
      bookResults.forEach(({ id, book }) => {
        booksMap[id] = book;
      });
      setBooks(booksMap);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load borrowing history');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const handleReturn = async (bookId) => {
    try {
      await api.put(`/borrow-book/${bookId}/return`, { book_id: bookId });
      fetchBorrows(page);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to return book');
    }
  };

  useEffect(() => {
    fetchBorrows();
  }, [userId, fetchBorrows]);

  const getStatusBadge = (status) => {
    const badges = {
      BORROWED: 'badge-warning',
      RETURNED: 'badge-success',
      LATE: 'badge-danger',
    };
    return badges[status] || '';
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>My Borrows</h1>
      </div>

      {error && (
        <div className="alert alert-error">{error}</div>
      )}

      {borrows.length === 0 && !error ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
          </svg>
          <h3>No Borrow History</h3>
          <p>You haven't borrowed any books yet.</p>
          <Link to="/books" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
            Browse Books
          </Link>
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Borrow Date</th>
                  <th>Duration</th>
                  <th>Return Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {borrows.map((record) => {
                  const book = books[record.book_id] || record.book || {};
                  return (
                    <tr key={record.borrow_record_id}>
                      <td>
                        <Link to={`/books/${record.book_id}`} style={{ fontWeight: 500 }}>
                          {book.title || `Book #${record.book_id}`}
                        </Link>
                        <br />
                        <small style={{ color: 'var(--text-muted)' }}>
                          by {book.author || 'Unknown'}
                        </small>
                      </td>
                      <td>{formatDate(record.borrow_date)}</td>
                      <td>{record.borrow_days} days</td>
                      <td>{formatDate(record.return_date)}</td>
                      <td>
                        <span className={`badge ${getStatusBadge(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td>
                        {record.status === 'BORROWED' && (
                          <button 
                            onClick={() => handleReturn(record.book_id)} 
                            className="btn btn-secondary btn-sm"
                          >
                            Return
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button onClick={() => fetchBorrows(page - 1)} disabled={page <= 1}>
              Previous
            </button>
            <span className="page-info">
              Page {page} of {totalPages}
            </span>
            <button onClick={() => fetchBorrows(page + 1)} disabled={page >= totalPages}>
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MyBorrows;
