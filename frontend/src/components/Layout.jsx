import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import RoleBasedNavigation from "./RoleBasedNavigation";
import InventoryItems from "./inventory";
import NewInventoryItem from "./NewInventoryItem";
import StockMoves from "./StockMoves";
import VehicleTypes from "./VehicleTypes";
import OperationsDashboard from "./OperationsDashboard";
import Bookings from "./Bookings";
import Customers from "./Customers";
import Vehicles from "./Vehicles";
import ServiceTypes from "./ServiceTypes";
import MyBookings from "./MyBookings";
import MyVehicles from "./MyVehicles";

export default function Layout() {
    const [page, setPage] = useState("home");
    const { user } = useAuth();

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            {/* Header */}
            <header className="app-header">
                <div className="container header-inner">
                    <h1 className="brand">AutoFuel Lanka</h1>
                    <RoleBasedNavigation onNavigate={setPage} currentPage={page} />
                </div>
            </header>

            {/* Main */}
            <main style={{ flex: 1 }}>
                {page === "home" && <Home onNavigate={setPage} />}

                {/* Customer-specific pages */}
                {page === "my-bookings" && (
                    <section className="section">
                        <div className="container">
                            <MyBookings />
                        </div>
                    </section>
                )}

                {page === "my-vehicles" && (
                    <section className="section">
                        <div className="container">
                            <MyVehicles />
                        </div>
                    </section>
                )}

                {/* Staff/Admin pages */}
                {page === "customers" && (
                    <section className="section">
                        <div className="container">
                            <ProtectedRoute requiredRole="STAFF">
                                <Customers />
                            </ProtectedRoute>
                        </div>
                    </section>
                )}

                {page === "vehicles" && (
                    <section className="section">
                        <div className="container">
                            <ProtectedRoute requiredRole="STAFF">
                                <Vehicles />
                            </ProtectedRoute>
                        </div>
                    </section>
                )}

                {page === "bookings" && (
                    <section className="section">
                        <div className="container">
                            <ProtectedRoute requiredRole="STAFF">
                                <Bookings />
                            </ProtectedRoute>
                        </div>
                    </section>
                )}

                {page === "service-types" && (
                    <section className="section">
                        <div className="container">
                            <ProtectedRoute requiredRole="STAFF">
                                <ServiceTypes />
                            </ProtectedRoute>
                        </div>
                    </section>
                )}

                {page === "inventory" && (
                    <section className="section">
                        <div className="container">
                            <ProtectedRoute requiredRole="STAFF">
                                <InventoryItems onNavigate={setPage} />
                            </ProtectedRoute>
                        </div>
                    </section>
                )}

                {page === "inventory-new" && (
                    <section className="section">
                        <div className="container">
                            <ProtectedRoute requiredRole="STAFF">
                                <NewInventoryItem onNavigate={setPage} />
                            </ProtectedRoute>
                        </div>
                    </section>
                )}

                {page === "inventory-moves" && (
                    <section className="section">
                        <div className="container">
                            <ProtectedRoute requiredRole="STAFF">
                                <StockMoves onNavigate={setPage} />
                            </ProtectedRoute>
                        </div>
                    </section>
                )}

                {page === "vehicle-types" && (
                    <section className="section">
                        <div className="container">
                            <ProtectedRoute requiredRole="STAFF">
                                <VehicleTypes />
                            </ProtectedRoute>
                        </div>
                    </section>
                )}

                {page === "operations-dashboard" && (
                    <section className="section">
                        <div className="container">
                            <ProtectedRoute requiredRole="STAFF">
                                <OperationsDashboard onNavigate={setPage} />
                            </ProtectedRoute>
                        </div>
                    </section>
                )}
            </main>

            {/* Footer */}
            <footer className="app-footer">
                <div className="container footer-inner">
                    <small>© {new Date().getFullYear()} AutoFuel Lanka. All rights reserved.</small>
                </div>
            </footer>
        </div>
    );
}

function Home({ onNavigate }) {
    const { user, hasRole } = useAuth();

    const getRoleBasedContent = () => {
        if (hasRole("CUSTOMER")) {
            return {
                title: "Welcome to AutoFuel Lanka",
                subtitle: "Manage your bookings and vehicles",
                buttons: [
                    { key: "my-bookings", label: "My Bookings", color: "primary" },
                    { key: "my-vehicles", label: "My Vehicles", color: "ok" }
                ]
            };
        } else if (hasRole("STAFF")) {
            return {
                title: "Operations Manager Dashboard",
                subtitle: "Complete system management, inventory, and reporting",
                buttons: [
                    { key: "operations-dashboard", label: "Operations Dashboard", color: "primary" },
                    { key: "customers", label: "Manage Customers", color: "ok" },
                    { key: "bookings", label: "All Bookings", color: "primary" },
                    { key: "vehicles", label: "Manage Vehicles", color: "ok" },
                    { key: "service-types", label: "Service Types", color: "primary" },
                    { key: "inventory", label: "Manage Inventory", color: "ok" },
                    { key: "vehicle-types", label: "Vehicle Types", color: "primary" }
                ]
            };
        }
        return {
            title: "AutoFuel Lanka",
            subtitle: "Fuel & Service Management System",
            buttons: []
        };
    };

    const content = getRoleBasedContent();

    return (
        <section className="hero">
            <div className="container hero-inner">
                <div>
                    <h2>{content.title}<span style={{ color: "var(--brand)" }}>—Simplified</span></h2>
                    <p>
                        {content.subtitle}
                        {user && <><br />Logged in as: <strong>{user.email}</strong> ({user.role})</>}
                    </p>
                    <div className="hero-cta">
                        {content.buttons.map(button => (
                            <button 
                                key={button.key}
                                className={`btn btn-${button.color}`} 
                                onClick={() => onNavigate(button.key)}
                            >
                                {button.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right-side quick info card on desktop */}
                <div className="hero-card">
                    <Row label="User Role" value={user?.role || "Guest"} />
                    <Row label="Email" value={user?.email || "Not logged in"} />
                    <Row label="Last login" value="Just now" />
                </div>
            </div>
        </section>
    );
}

function Row({ label, value }) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <span style={{ color: "#6b7280" }}>{label}</span>
            <strong>{value}</strong>
        </div>
    );
}
