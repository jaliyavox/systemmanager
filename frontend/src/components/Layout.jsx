// src/components/Layout.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import RoleBasedNavigation from "./RoleBasedNavigation";
import InventoryItems from "./inventory";
import NewInventoryItem from "./NewInventoryItem";
import StockMoves from "./StockMoves";
import VehicleTypes from "./VehicleTypes";
import OperationsDashboard from "./OperationsDashboard";
import InvoiceList from "./InvoiceList";
import InvoiceDetail from "./InvoiceDetail";
import FinanceLedger from "./FinanceLedger";
import Bookings from "./Bookings";
import Customers from "./Customers";
import Vehicles from "./Vehicles";
import ServiceTypes from "./ServiceTypes";
import CustomerDashboard from "./CustomerDashboard";
import MyVehicles from "./MyVehicles";

function Home({ onNavigate }) {
    const { user, hasRole } = useAuth();
    const getRoleBasedContent = () => {
        if (hasRole("CUSTOMER")) {
            return {
                title: "Welcome to AutoFuel Lanka",
                subtitle: "Manage your fuel station visits, service appointments, and vehicles",
                buttons: [
                    { key: "my-bookings", label: "My Dashboard", color: "primary" },
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
        } else if (hasRole("FINANCE")) {
            return {
                title: "Finance Dashboard",
                subtitle: "Invoice management, payments, and financial reporting",
                buttons: [
                    { key: "invoices", label: "Manage Invoices", color: "primary" },
                    { key: "finance-ledger", label: "Finance Ledger", color: "ok" }
                ]
            };
        }
        return { title: "AutoFuel Lanka", subtitle: "Fuel & Service Management System", buttons: [] };
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

export default function Layout() {
    const [page, setPage] = useState("home");
    const { user } = useAuth();

    // --- hash URL sync (minimal) ---
    const DEFAULT_PAGE = "home";
    const readHash = () => (window.location.hash || "").replace(/^#\/?/, "") || DEFAULT_PAGE;
    const writeHash = (key) => {
        const h = `#/${key}`;
        if (window.location.hash !== h) window.history.pushState({}, "", h);
    };
    const navigateTo = (key) => { if (key) { setPage(key); writeHash(key); } };
    useEffect(() => {
        setPage(readHash());
        const onChange = () => setPage(readHash());
        window.addEventListener("popstate", onChange);
        window.addEventListener("hashchange", onChange);
        return () => {
            window.removeEventListener("popstate", onChange);
            window.removeEventListener("hashchange", onChange);
        };
    }, []);
    // --- end hash sync ---

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <header className="app-header">
                <div className="container header-inner">
                    <h1 className="brand">AutoFuel Lanka</h1>
                    <RoleBasedNavigation onNavigate={navigateTo} currentPage={page} />
                </div>
            </header>

            <main style={{ flex: 1 }}>
                {page === "home" && <Home onNavigate={navigateTo} />}

                {/* Customer */}
                {page === "my-bookings" && <section className="section"><div className="container"><CustomerDashboard /></div></section>}
                {page === "my-vehicles" && <section className="section"><div className="container"><MyVehicles /></div></section>}

                {/* Staff/Admin */}
                {page === "customers" && <section className="section"><div className="container"><ProtectedRoute requiredRole="STAFF"><Customers /></ProtectedRoute></div></section>}
                {page === "vehicles" && <section className="section"><div className="container"><ProtectedRoute requiredRole="STAFF"><Vehicles /></ProtectedRoute></div></section>}
                {page === "bookings" && <section className="section"><div className="container"><ProtectedRoute requiredRole="STAFF"><Bookings /></ProtectedRoute></div></section>}
                {page === "service-types" && <section className="section"><div className="container"><ProtectedRoute requiredRole="STAFF"><ServiceTypes /></ProtectedRoute></div></section>}
                {page === "inventory" && <section className="section"><div className="container"><ProtectedRoute requiredRole="STAFF"><InventoryItems onNavigate={navigateTo} /></ProtectedRoute></div></section>}
                {page === "inventory-new" && <section className="section"><div className="container"><ProtectedRoute requiredRole="STAFF"><NewInventoryItem onNavigate={navigateTo} /></ProtectedRoute></div></section>}
                {page === "inventory-moves" && <section className="section"><div className="container"><ProtectedRoute requiredRole="STAFF"><StockMoves onNavigate={navigateTo} /></ProtectedRoute></div></section>}
                {page === "vehicle-types" && <section className="section"><div className="container"><ProtectedRoute requiredRole="STAFF"><VehicleTypes /></ProtectedRoute></div></section>}
                {page === "operations-dashboard" && <section className="section"><div className="container"><ProtectedRoute requiredRole="STAFF"><OperationsDashboard onNavigate={navigateTo} /></ProtectedRoute></div></section>}

                {/* Finance */}
                {page === "invoices" && <section className="section"><div className="container"><ProtectedRoute requiredRole="FINANCE"><InvoiceList onNavigate={navigateTo} /></ProtectedRoute></div></section>}
                {page.startsWith("invoice-detail-") && (
                    <section className="section"><div className="container">
                        <ProtectedRoute requiredRole="FINANCE">
                            <InvoiceDetail invoiceId={parseInt(page.replace("invoice-detail-", ""))} onNavigate={navigateTo} />
                        </ProtectedRoute>
                    </div></section>
                )}
                {page === "finance-ledger" && <section className="section"><div className="container"><ProtectedRoute requiredRole="FINANCE"><FinanceLedger onNavigate={navigateTo} /></ProtectedRoute></div></section>}
            </main>

            <footer className="app-footer">
                <div className="container footer-inner">
                    <small>© {new Date().getFullYear()} AutoFuel Lanka. All rights reserved.</small>
                </div>
            </footer>
        </div>
    );
}
