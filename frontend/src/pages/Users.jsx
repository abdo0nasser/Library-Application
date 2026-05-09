import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const Users = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [userHistory, setUserHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', age: '', description: '' });
  const [editLoading, setEditLoading] = useState(false);

  const fetchUsers = useCallback(async (pageNum = 1, limitNum = limit) => {
    setLoading(true);
    try {
      const res = await api.get('/user', {
        params: { page: pageNum, limit: limitNum },
      });

      const data = res.data.data || res.data;
      const metadata = res.data.metadata;

      setUsers(data);
      if (metadata) {
        setTotalPages(metadata.totalPages || 1);
      }
      setPage(pageNum);
    } catch {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const isAdmin = currentUser?.user_role === 'ADMIN' || currentUser?.user_role === 'NORMAL';

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name || '',
      age: user.age || '',
      description: user.description || '',
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const res = await api.put(`/user/${selectedUser.id}`, editForm);
      setUsers(users.map(u => u.id === selectedUser.id ? (res.data.data || res.data) : u));
      setShowEditModal(false);
      setSelectedUser(null);
    } catch {
      setError('Failed to update user');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteClick = async (user) => {
    if (!window.confirm(`Are you sure you want to delete user "${user.name}"?`)) return;
    try {
      await api.delete(`/user/${user.id}`);
      fetchUsers(page);
    } catch {
      setError('Failed to delete user');
    }
  };

  const handleViewHistory = async (user) => {
    setSelectedUser(user);
    setShowHistoryModal(true);
    setHistoryLoading(true);
    try {
      const res = await api.get(`/borrow-book/user-history/${user.id}`, {
        params: { page: 1, limit: 10 },
      });
      setUserHistory(res.data.data || res.data);
    } catch {
      setError('Failed to load borrow history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      BORROWED: 'badge-warning',
      RETURNED: 'badge-success',
      LATE: 'badge-danger',
    };
    return badges[status] || '';
  };

  if (!isAdmin) {
    return (
      <div className="page">
        <div className="alert alert-error">
          You do not have permission to view this page.
        </div>
      </div>
    );
  }

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
        <h1>Users</h1>
      </div>

      {error && (
        <div className="alert alert-error">{error}</div>
      )}

      {users.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
          <h3>No Users Found</h3>
          <p>There are no users in the system.</p>
        </div>
      ) : (
        <>
          <div className="pagination-controls">
            <div className="pagination-info">
              Showing {users.length} of {totalPages > 0 ? totalPages * limit : limit} users
            </div>
            <div className="pagination-limit">
              <label>Items per page:</label>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  fetchUsers(1, Number(e.target.value));
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th className="text-center">#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th className="text-center">Role</th>
                  <th className="text-center">Verified</th>
                  <th className="text-center">Joined</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="text-center">{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td className="text-center">
                      <span className="badge badge-info">{user.user_role === 'NORMAL' ? 'USER' : user.user_role}</span>
                    </td>
                    <td className="text-center">
                      <span className={`badge ${user.email_verified_at ? 'badge-success' : 'badge-warning'}`}>
                        {user.email_verified_at ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="text-center">{formatDate(user.createdAt)}</td>
                    <td className="text-center">
                      <div className="action-buttons">
                        <button
                          onClick={() => handleViewHistory(user)}
                          className="btn btn-ghost btn-sm"
                          title="View Borrow History"
                        >
                          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                            <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEditClick(user)}
                          className="btn btn-ghost btn-sm"
                          title="Edit User"
                        >
                          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(user)}
                          className="btn btn-ghost btn-sm text-danger"
                          title="Delete User"
                          disabled={user.id === currentUser.id}
                        >
                          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button onClick={() => fetchUsers(page - 1)} disabled={page <= 1}>
              Previous
            </button>
            <span className="page-info">
              Page {page} of {totalPages}
            </span>
            <button onClick={() => fetchUsers(page + 1)} disabled={page >= totalPages}>
              Next
            </button>
          </div>
        </>
      )}

      {showEditModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit User</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    value={editForm.age}
                    onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                    min={18}
                    max={75}
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    maxLength={128}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={editLoading}>
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showHistoryModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Borrow History - {selectedUser.name}</h2>
              <button className="modal-close" onClick={() => setShowHistoryModal(false)}>
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              {historyLoading ? (
                <div className="loading-screen">
                  <div className="spinner"></div>
                </div>
              ) : userHistory.length === 0 ? (
                <p className="text-center text-muted">No borrow history found.</p>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Book ID</th>
                      <th>Borrow Date</th>
                      <th>Days</th>
                      <th>Return Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userHistory.map((record) => (
                      <tr key={record.borrow_record_id}>
                        <td>{record.book_id}</td>
                        <td>{formatDate(record.borrow_date)}</td>
                        <td>{record.borrow_days}</td>
                        <td>{formatDate(record.return_date)}</td>
                        <td>
                          <span className={`badge ${getStatusBadge(record.status)}`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
