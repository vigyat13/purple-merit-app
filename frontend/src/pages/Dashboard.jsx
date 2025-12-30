import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const Dashboard = () => {
  // --- 1. User State (Replaces useAuth for stability) ---
  const [user, setUser] = useState(null);

  // --- 2. Admin Panel State ---
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // --- 3. Initial Load: Get User from Local Storage ---
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // If no user found, redirect to login
      window.location.href = '/login';
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

  // --- 5. Render ---
  
  // Show a simple loading state while checking Local Storage
  if (!user) {
    return <div className="p-4">Loading dashboard...</div>;
  }

  return (
    <div className="container mt-4">
      <h1>Dashboard</h1>
      
      {user.role === 'admin' ? (
        // --- ADMIN VIEW ---
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>User Management System</h3>
            <span className="badge bg-primary">Admin Access</span>
          </div>

          {loading ? <p>Loading data...</p> : (
            <>
              <div className="table-responsive">
                <table className="table table-bordered table-hover shadow-sm">
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
                          <span className={`badge ${u.status === 'active' ? 'bg-success' : 'bg-danger'}`}>
                            {u.status.toUpperCase()}
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
            </>
          )}
        </div>
      ) : (
        // --- USER VIEW ---
        <div className="text-center mt-5">
            <div className="card shadow-sm p-5">
                <h2 className="display-6">Welcome, <span className="text-primary">{user.full_name}</span>!</h2>
                <p className="lead mt-3">You have standard user access.</p>
                <hr className="my-4"/>
                <p>Visit your profile to manage your account details.</p>
                <a href="/profile" className="btn btn-primary">Go to Profile</a>
            </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;