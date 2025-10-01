import { useAuth } from '../contexts/AuthContext';

export default function RoleBasedNavigation({ onNavigate, currentPage }) {
    const { user, logout, hasRole } = useAuth();

    const getNavigationItems = () => {
        const items = [
            { key: "home", label: "Home", roles: ["CUSTOMER", "STAFF", "ADMIN"] }
        ];

        // Customer-specific pages
        if (hasRole("CUSTOMER")) {
            items.push(
                { key: "my-bookings", label: "My Bookings", roles: ["CUSTOMER"] },
                { key: "my-vehicles", label: "My Vehicles", roles: ["CUSTOMER"] }
            );
        }

        // Staff and Admin pages
        if (hasRole("STAFF")) {
            items.push(
                { key: "customers", label: "Customers", roles: ["STAFF", "ADMIN"] },
                { key: "vehicles", label: "Vehicles", roles: ["STAFF", "ADMIN"] },
                { key: "bookings", label: "All Bookings", roles: ["STAFF", "ADMIN"] },
                { key: "service-types", label: "Service Types", roles: ["STAFF", "ADMIN"] },
                { key: "inventory", label: "Inventory", roles: ["STAFF", "ADMIN"] }
            );
        }

        // Admin-only pages
        if (hasRole("ADMIN")) {
            items.push(
                { key: "reports", label: "Reports", roles: ["ADMIN"] }
            );
        }

        return items;
    };

    const navigationItems = getNavigationItems();

    return (
        <nav className="nav">
            {navigationItems.map(item => (
                <button 
                    key={item.key}
                    onClick={() => onNavigate(item.key)}
                    style={{
                        background: currentPage === item.key ? '#007bff' : 'transparent',
                        color: currentPage === item.key ? 'white' : 'inherit'
                    }}
                >
                    {item.label}
                </button>
            ))}
            
            {/* User info and logout */}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ color: '#666', fontSize: '0.9rem' }}>
                    {user?.email} ({user?.role})
                </span>
                <button 
                    onClick={logout}
                    style={{
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Logout
                </button>
            </div>
        </nav>
    );
}
