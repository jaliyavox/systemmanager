import { useAuth } from '../contexts/AuthContext';

export default function RoleBasedNavigation({ onNavigate, currentPage }) {
    const { user, logout, hasRole } = useAuth();

    const getNavigationItems = () => {
        const items = [
            { key: "home", label: "Home", roles: ["CUSTOMER", "STAFF", "FINANCE"] }
        ];

        if (hasRole("CUSTOMER")) {
            items.push(
                { key: "my-vehicles", label: "My Vehicles", roles: ["CUSTOMER"] }
            );
        }

        // Staff: keep only Operations Dashboard in the top nav
        if (hasRole("STAFF")) {
            items.push(
                { key: "operations-dashboard", label: "Operations Dashboard", roles: ["STAFF"] }
            );
        }

        if (hasRole("FINANCE")) {
            items.push(
                { key: "invoices", label: "Invoices", roles: ["FINANCE"] },
                { key: "finance-ledger", label: "Finance Ledger", roles: ["FINANCE"] }
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
