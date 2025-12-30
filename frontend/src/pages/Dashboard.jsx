import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import for redirection
import api from '../utils/api';

const Dashboard = () => {
  const navigate = useNavigate(); // Initialize navigation

  // --- 1. User State ---
  const [user, setUser] = useState(null);

  // --- 2. Admin Panel State ---
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // --- 3. Initial Load: Get User from Local Storage ---
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    } else {
      // If no user or token found, redirect to login
      handleLogout();
    }
  }, []);

  // --- 4. Fetch Data (Only if Admin) ---
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers(page);
    } else if (user) {
      // If normal user, stop loading immediately
      setLoading(false);
    }
  }, [user, page]);

  const fetchUsers = async (pageNum) => {
    try {
      const res = await api.get(`/admin/users?page=${pageNum}`);
      setUsers(res.data.users);
      setTotalPages(res.data.pages);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch users", error);
      // If unauthorized (401), force logout
      if (error.response && error.response.status === 401) {
        handleLogout();
      }
      setLoading(false);
    }
  };

  const toggleStatus = async (userId, currentStatus) => {
    if (!window.confirm("Change user status?")) return;
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await api.patch(`/admin/users/${userId}/status`, { status: newStatus });
      // Update UI immediately without refreshing
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    } catch (error) {
      alert("Failed to update status");
    }
  };

  // --- 5. Logout Function (New) ---
  const handleLogout = () => {
    // Clear all storage to prevent "Ghost User" issues
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Redirect to login
    navigate('/login');
  };

  // --- 6. Render ---
  
  if (!user) {
    return <div className="p-4 text-center">Loading dashboard...</div>;
  }

  return (
    <div className="container mt-4">
      {/* --- HEADER WITH LOGOUT --- */}
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
        <h1 className="h2 mb-0">Dashboard</h1>
        <div className="d-flex align-items-center gap-3">
          <span className="text-muted d-none d-md-block">
            Signed in as <strong>{user.full_name}</strong>
          </span>
          <button 
            onClick={handleLogout} 
            className="btn btn-outline-danger btn-sm"
          >
            Logout
          </button>
        </div>
      </div>
      
      {user.role === 'admin' ? (
        // --- ADMIN VIEW ---
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="h4">User Management</h3>
            <span className="badge bg-primary">Admin Mode</span>
          </div>

          {loading ? <p>Loading data...</p> : (
            <>
              <div className="table-responsive">
                <table className="table table-bordered table-hover shadow-sm bg-white">
                  <thead className="table-light">
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td>{u.full_name}</td>
                        <td>{u.email}</td>
                        <td>{u.role}</td>
                        <td>
                          <span className={`badge ${u.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                            {u.status ? u.status.toUpperCase() : 'UNKNOWN'}
                          </span>
                        </td>
                        <td>
                          {u.id !== user.id && (
                            <button 
                              className={`btn btn-sm ${u.status === 'active' ? 'btn-danger' : 'btn-success'}`}
                              onClick={() => toggleStatus(u.id, u.status)}
                            >
                              {u.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center gap-2 mt-3">
                    <button 
                    className="btn btn-outline-primary" 
                    disabled={page === 1} 
                    onClick={() => setPage(p => p - 1)}
                    >
                    Previous
                    </button>
                    <span className="align-self-center">Page {page} of {totalPages}</span>
                    <button 
                    className="btn btn-outline-primary" 
                    disabled={page === totalPages} 
                    onClick={() => setPage(p => p + 1)}
                    >
                    Next
                    </button>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        // --- USER VIEW ---
        <div className="text-center mt-5">
            <div className="card shadow-sm p-5 border-0 bg-light">
                <h2 className="display-6">Welcome, <span className="text-primary">{user.full_name}</span>!</h2>
                <p className="lead mt-3">You have standard user access.</p>
                <hr className="my-4"/>
                <p>Visit your profile to manage your account details.</p>
                <div className="d-flex justify-content-center gap-3">
                    <button className="btn btn-primary" onClick={() => alert("Profile page coming soon!")}>
                        Go to Profile
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;