import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  },
};

const StatCard = ({ icon, label, value, color, delay }) => (
  <motion.div
    className="stat-card"
    variants={itemVariants}
  >
    <div className={`stat-icon ${color}`}>
      {icon}
    </div>
    <div className="stat-info">
      <h3>{value}</h3>
      <p>{label}</p>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableCopies: 0,
    borrowedBooks: 0,
    activeBorrows: 0,
  });
  const [recentBooks, setRecentBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  const isAdmin = user?.user_role === 'ADMIN';
  const userId = user?.id || user?.sub;

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const booksRes = await api.get('/book', { params: { limit: 50 } });
        const booksData = booksRes.data.data || booksRes.data;
        const booksList = Array.isArray(booksData) ? booksData : [];

        const totalBooks = booksList.length;
        const availableCopies = booksList.reduce(
          (sum, b) => sum + (b.available_copies || 0), 0
        );

        setRecentBooks(booksList.slice(0, 4));

        let borrowedBooks = 0;
        let activeBorrows = 0;
        if (userId) {
          const borrowRes = await api.get(`/borrow-book/user-history/${userId}`, {
            params: { limit: 100 },
          });
          const borrowData = borrowRes.data.data || borrowRes.data;
          if (Array.isArray(borrowData)) {
            borrowedBooks = borrowData.length;
            activeBorrows = borrowData.filter(
              (b) => b.status === 'BORROWED' || b.status === 'LATE'
            ).length;
          }
        }

        setStats({ totalBooks, availableCopies, borrowedBooks, activeBorrows });
      } catch {
        // silent fail
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [userId]);

  const statCards = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
        </svg>
      ),
      label: 'Total Books',
      value: stats.totalBooks,
      color: 'teal',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      ),
      label: 'Available Copies',
      value: stats.availableCopies,
      color: 'green',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
        </svg>
      ),
      label: 'My Borrows',
      value: stats.borrowedBooks,
      color: 'blue',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
      ),
      label: 'Active Now',
      value: stats.activeBorrows,
      color: 'amber',
    },
  ];

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <motion.div
        className="dashboard-hero"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="hero-content">
          <h1>{greeting}, {user?.name || 'Reader'}!</h1>
          <p>Here's what's happening in your library today</p>
        </div>
        <div className="hero-actions">
          <Link to="/books" className="btn btn-primary" style={{ width: 'auto' }}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
            </svg>
            Browse Library
          </Link>
          {isAdmin && (
            <Link to="/add-book" className="btn btn-secondary" style={{ width: 'auto' }}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              Add Book
            </Link>
          )}
        </div>
      </motion.div>

      <motion.div
        className="stats-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {statCards.map((card, i) => (
          <StatCard key={i} {...card} />
        ))}
      </motion.div>

      <div className="dashboard-grid">
        <motion.div
          className="dashboard-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2>Recent Books</h2>
          {recentBooks.length === 0 ? (
            <div className="empty-section">
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No books added yet.
              </p>
            </div>
          ) : (
            <div className="recent-books">
              {recentBooks.map((book) => (
                <Link
                  key={book.id}
                  to={`/books/${book.id}`}
                  className="recent-book-card"
                >
                  <div className="recent-book-cover">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
                    </svg>
                  </div>
                  <div className="recent-book-info">
                    <h4>{book.title}</h4>
                    <p>by {book.author || 'Unknown'}</p>
                  </div>
                  <span className="recent-book-status">
                    {book.available_copies > 0 ? `${book.available_copies} available` : 'Unavailable'}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          className="dashboard-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <Link to="/books" className="quick-action-btn">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
              </svg>
              <span>Browse Books</span>
            </Link>
            <Link to="/my-borrows" className="quick-action-btn">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
              <span>My Borrows</span>
            </Link>
            <Link to="/profile" className="quick-action-btn">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              <span>Profile</span>
            </Link>
            {isAdmin && (
              <Link to="/users" className="quick-action-btn">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                </svg>
                <span>Users</span>
              </Link>
            )}
            <Link to="/books" className="quick-action-btn">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
              </svg>
              <span>View Details</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
