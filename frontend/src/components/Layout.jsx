import { useState } from "react";
import Inventory from "./Inventory";
import Bookings from "./Bookings";

export default function Layout() {
    const [page, setPage] = useState("home");

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            {/* Header */}
            <header className="app-header">
                <div className="container header-inner">
                    <h1 className="brand">AutoFuel Lanka</h1>
                    <nav className="nav">
                        <button onClick={() => setPage("home")}>Home</button>
                        <button onClick={() => setPage("inventory")}>Inventory</button>
                        <button onClick={() => setPage("bookings")}>Bookings</button>
                    </nav>
                </div>
            </header>

            {/* Main */}
            <main style={{ flex: 1 }}>
                {page === "home" && <Home onNavigate={setPage} />}

                {page === "inventory" && (
                    <section className="section">
                        <div className="container">
                            <Inventory />
                        </div>
                    </section>
                )}

                {page === "bookings" && (
                    <section className="section">
                        <div className="container">
                            <Bookings />
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
    return (
        <section className="hero">
            <div className="container hero-inner">
                <div>
                    <h2>Fuel & Service Management<span style={{ color: "var(--brand)" }}>—Simplified</span></h2>
                    <p>
                        Track inventory levels, schedule services, and manage customers from a single, modern dashboard.
                        Built for fuel stations and service centers.
                    </p>
                    <div className="hero-cta">
                        <button className="btn btn-primary" onClick={() => onNavigate("inventory")}>Manage Inventory</button>
                        <button className="btn btn-ok" onClick={() => onNavigate("bookings")}>Manage Bookings</button>
                    </div>
                </div>

                {/* Right-side quick info card on desktop */}
                <div className="hero-card">
                    <Row label="Open bookings today" value="—" />
                    <Row label="Low-stock items" value="—" />
                    <Row label="Last sync" value="Just now" />
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
