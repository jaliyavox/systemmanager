import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function UserManagement() {
    const { token } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const [form, setForm] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: 'CUSTOMER',
        address: '',
        city: '',
        postalCode: ''
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/users', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            setUsers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
            const method = editingUser ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(form)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save user');
            }

            // Refresh users list
            await fetchUsers();
            
            // Reset form
            setForm({
                email: '',
                password: '',
                firstName: '',
                lastName: '',
                phone: '',
                role: 'CUSTOMER',
                address: '',
                city: '',
                postalCode: ''
            });
            setShowForm(false);
            setEditingUser(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEdit = (user) => {
        setForm({
            email: user.email,
            password: '', // Don't pre-fill password for security
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            phone: user.phone || '',
            role: user.role,
            address: user.address || '',
            city: user.city || '',
            postalCode: user.postalCode || ''
        });
        setEditingUser(user);
        setShowForm(true);
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) {
            return;
        }

        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete user');
            }

            // Refresh users list
            await fetchUsers();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCancel = () => {
        setForm({
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            phone: '',
            role: 'CUSTOMER',
            address: '',
            city: '',
            postalCode: ''
        });
        setShowForm(false);
        setEditingUser(null);
    };

    const filteredUsers = users.filter(user => {
        const matchesFilter = filter === 'all' || user.role === filter;
        const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesFilter && matchesSearch;
    });

    const getRoleColor = (role) => {
        switch (role) {
            case 'ADMIN': return '#dc3545';
            case 'STAFF': return '#007bff';
            case 'FINANCE': return '#28a745';
            case 'CUSTOMER': return '#6c757d';
            default: return '#6c757d';
        }
    };

    if (loading) return <div className="loading">Loading users...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="user-management-container">
            <div className="page-header">
                <h1>User Management</h1>
                <div className="header-actions">
                    <button 
                        onClick={() => setShowForm(true)}
                        className="btn btn-primary"
                    >
                        Add New User
                    </button>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="filters-section">
                <div className="filter-controls">
                    <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="all">All Users</option>
                        <option value="ADMIN">Admins</option>
                        <option value="STAFF">Staff</option>
                        <option value="FINANCE">Finance</option>
                        <option value="CUSTOMER">Customers</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <div className="form-section">
                    <h3>{editingUser ? 'Edit User' : 'Add New User'}</h3>
                    <form onSubmit={handleSubmit} className="user-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Password {editingUser ? '(leave blank to keep current)' : '*'}</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleInputChange}
                                    required={!editingUser}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={form.firstName}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={form.lastName}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Role *</label>
                                <select
                                    name="role"
                                    value={form.role}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="CUSTOMER">Customer</option>
                                    <option value="STAFF">Staff</option>
                                    <option value="FINANCE">Finance</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={form.address}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={form.city}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Postal Code</label>
                                <input
                                    type="text"
                                    name="postalCode"
                                    value={form.postalCode}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary">
                                {editingUser ? 'Update User' : 'Create User'}
                            </button>
                            <button type="button" onClick={handleCancel} className="btn btn-secondary">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Users Table */}
            <div className="users-table">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Email</th>
                            <th>Name</th>
                            <th>Phone</th>
                            <th>Role</th>
                            <th>Location</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.email}</td>
                                <td>
                                    {user.firstName && user.lastName 
                                        ? `${user.firstName} ${user.lastName}`
                                        : 'N/A'
                                    }
                                </td>
                                <td>{user.phone || 'N/A'}</td>
                                <td>
                                    <span 
                                        className="role-badge" 
                                        style={{ backgroundColor: getRoleColor(user.role) }}
                                    >
                                        {user.role}
                                    </span>
                                </td>
                                <td>
                                    {user.city && user.postalCode 
                                        ? `${user.city}, ${user.postalCode}`
                                        : 'N/A'
                                    }
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button 
                                            onClick={() => handleEdit(user)}
                                            className="btn btn-sm btn-primary"
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(user.id)}
                                            className="btn btn-sm btn-danger"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredUsers.length === 0 && (
                <div className="no-data">
                    <p>No users found matching your criteria.</p>
                </div>
            )}

            {/* Statistics */}
            <div className="user-stats">
                <h3>User Statistics</h3>
                <div className="stats-grid">
                    <div className="stat-card">
                        <span className="stat-number">{users.filter(u => u.role === 'CUSTOMER').length}</span>
                        <span className="stat-label">Customers</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">{users.filter(u => u.role === 'STAFF').length}</span>
                        <span className="stat-label">Staff Members</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">{users.filter(u => u.role === 'FINANCE').length}</span>
                        <span className="stat-label">Finance Users</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">{users.filter(u => u.role === 'ADMIN').length}</span>
                        <span className="stat-label">Admins</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
