import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext'; // Import useAuth to get token
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', isActive: true });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { user, token, isAuthenticated } = useAuth(); // Get current user, token, and auth status
  
  // Updated API configuration
  const API_BASE = 'http://localhost:3000/api/admin/users'; // Full URL with protocol
  
  // Get token from AuthContext
  const getAuthToken = () => {
    return token; // Use the token directly from AuthContext
  };

  const getHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    // Check if user is authenticated before making API call
    if (!isAuthenticated || !token) {
      setError('Authentication required. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(''); // Clear previous errors
      
      const headers = getHeaders();
      console.log('Fetching users with headers:', headers); // Debug log
      
      const response = await fetch(API_BASE, { 
        method: 'GET',
        headers,
        // Add credentials for CORS
        credentials: 'include'
      });
      
      console.log('Response status:', response.status); // Debug log
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response:', errorData); // Debug log
        
        if (response.status === 401) {
          setError('Authentication failed. Please log in again.');
        } else {
          throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
        }
        return;
      }
      
      const data = await response.json();
      console.log('Fetched users:', data); // Debug log
      // ✅ CORRECT
setUsers(Array.isArray(data.data) ? data.data : []);
      
    } catch (err) {
      console.error('Fetch error:', err); // Debug log
      setError(`Error: ${err.message}`);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user._id);
    setEditForm({
      name: user.name,
      isActive: user.isActive
    });
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm({ name: '', isActive: true });
  };

  const handleUpdateUser = async (userId) => {
    try {
      const headers = getHeaders();
      
      const response = await fetch(`${API_BASE}/${userId}`, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to update user: ${response.status} ${errorData}`);
      }

      await fetchUsers();
      setEditingUser(null);
      setSuccess('User updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Update error:', err);
      setError(err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const headers = getHeaders();
      
      const response = await fetch(`${API_BASE}/${userId}`, {
        method: 'DELETE',
        headers,
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to delete user: ${response.status} ${errorData}`);
      }

      await fetchUsers();
      setDeleteConfirm(null);
      setSuccess('User deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="user-management">
        <div className="loading">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="user-management-header">
        <h1>User Management</h1>
        <button onClick={fetchUsers} className="refresh-btn">
          Refresh
        </button>
      </div>

      

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError('')} className="close-btn">×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
          <button onClick={() => setSuccess('')} className="close-btn">×</button>
        </div>
      )}

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Created At</th>
              <th>ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>
                  {editingUser === user._id ? (
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className="edit-input"
                    />
                  ) : (
                    user.name
                  )}
                </td>
                <td>{user.email}</td>
                <td>
                  {editingUser === user._id ? (
                    <select
                      value={editForm.isActive}
                      onChange={(e) => setEditForm({...editForm, isActive: e.target.value === 'true'})}
                      className="edit-select"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  ) : (
                    <span className={`status ${user.isActive ? 'active' : 'inactive'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  )}
                </td>
                <td>{formatDate(user.createdAt)}</td>
                <td className="user-id">{user._id}</td>
                <td className="actions">
                  {editingUser === user._id ? (
                    <div className="edit-actions">
                      <button 
                        onClick={() => handleUpdateUser(user._id)}
                        className="save-btn"
                      >
                        Save
                      </button>
                      <button 
                        onClick={handleCancelEdit}
                        className="cancel-btn"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleEdit(user)}
                        className="edit-btn"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => setDeleteConfirm(user._id)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && !loading && (
          <div className="no-users">
            {error ? 'Unable to load users. Please check the console for details.' : 'No users found'}
          </div>
        )}
      </div>

      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this user? This action cannot be undone.</p>
            <div className="modal-actions">
              <button 
                onClick={() => handleDeleteUser(deleteConfirm)}
                className="confirm-delete-btn"
              >
                Delete
              </button>
              <button 
                onClick={() => setDeleteConfirm(null)}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;