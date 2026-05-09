import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

const Books = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(12);

  const fetchBooks = useCallback(async (pageNum = 1, limitNum = limit) => {
    setLoading(true);
    try {
      const res = await api.get("/book", {
        params: { page: pageNum, limit: limitNum },
      });

      const data = res.data.data || res.data;
      const metadata = res.data.metadata;
      
      setBooks(data);
      if (metadata) {
        setTotalPages(metadata.totalPages || 1);
      }
      setPage(pageNum);
    } catch {
      setError("Failed to load books");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const isAdmin = user?.user_role === 'ADMIN';

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
        <h1>Library</h1>
        {isAdmin && (
          <Link to="/add-book" className="btn btn-primary">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Add Book
          </Link>
        )}
      </div>

      {error && (
        <div className="alert alert-error">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          {error}
        </div>
      )}

      {books.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
          </svg>
          <h3>No Books Yet</h3>
          <p>Be the first to add a book to the library!</p>
        </div>
      ) : (
        <>
          <div className="pagination-controls">
            <div className="pagination-info">
              Showing {books.length} of {totalPages > 0 ? totalPages * limit : limit} items
            </div>
            <div className="pagination-limit">
              <label>Items per page:</label>
              <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); fetchBooks(1, Number(e.target.value)); }}>
                <option value={6}>6</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
              </select>
            </div>
          </div>

          <div className="book-grid">
            {books.map((book) => (
              <div key={book.id} className="book-card">
                <div className="book-card-header">
                  <h3>{book.title}</h3>
                  <p className="author">by {book.author}</p>
                </div>
                <div className="book-card-body">
                  <div className="book-stats">
                    <div className="book-stat">
                      <div className="value">{book.available_copies}</div>
                      <div className="label">Available</div>
                    </div>
                    <div className="book-stat">
                      <div className="value">{book.total_copies}</div>
                      <div className="label">Total</div>
                    </div>
                  </div>
                  <Link to={`/books/${book.id}`} className="btn btn-secondary" style={{ width: "100%" }}>
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="pagination">
            <button onClick={() => fetchBooks(page - 1)} disabled={page <= 1}>
              Previous
            </button>
            <span className="page-info">
              Page {page} of {totalPages}
            </span>
            <button onClick={() => fetchBooks(page + 1)} disabled={page >= totalPages}>
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Books;
