import { useEffect, useState } from "react";

const API_BASE = "http://localhost:8080";

export default function OperationsDashboard({ onNavigate }) {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    const loadSummary = async () => {
        setLoading(true);
        setErr("");
        try {
            const res = await fetch(`${API_BASE}/api/reports/dashboard-summary`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setSummary(data);
        } catch (e) {
            setErr(String(e.message));
        } finally {
            setLoading(false);
        }
    };

    const downloadReport = async (reportType) => {
        try {
            const res = await fetch(`${API_BASE}/api/reports/${reportType}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${reportType}_report_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            alert("Error downloading report: " + e.message);
        }
    };

    useEffect(() => {
        loadSummary();
    }, []);

    return (
        <div style={{ padding: 16, fontFamily: "system-ui, sans-serif", maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
                <h1>Operations Manager Dashboard</h1>
                <button 
                    onClick={() => onNavigate && onNavigate("home")}
                    style={{ padding: "8px 16px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: 4 }}
                >
                    Back to Home
                </button>
            </div>

            {loading ? (
                <p>Loading dashboard...</p>
            ) : err ? (
                <p style={{ color: "red" }}>Error: {err}</p>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div style={{ 
                        display: "grid", 
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
                        gap: 20, 
                        marginBottom: 40 
                    }}>
                        <SummaryCard 
                            title="Inventory Items" 
                            value={summary?.totalInventoryItems || 0}
                            color="#007bff"
                            icon="📦"
                        />
                        <SummaryCard 
                            title="Low Stock Items" 
                            value={summary?.lowStockItems || 0}
                            color={summary?.lowStockItems > 0 ? "#dc3545" : "#28a745"}
                            icon="⚠️"
                        />
                        <SummaryCard 
                            title="Total Customers" 
                            value={summary?.totalCustomers || 0}
                            color="#17a2b8"
                            icon="👥"
                        />
                        <SummaryCard 
                            title="Total Bookings" 
                            value={summary?.totalBookings || 0}
                            color="#ffc107"
                            icon="📅"
                        />
                        <SummaryCard 
                            title="Vehicle Types" 
                            value={summary?.totalVehicleTypes || 0}
                            color="#6f42c1"
                            icon="🚗"
                        />
                    </div>

                    {/* Quick Actions */}
                    <div style={{ marginBottom: 40 }}>
                        <h2>Quick Actions</h2>
                        <div style={{ 
                            display: "grid", 
                            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
                            gap: 20 
                        }}>
                            <QuickActionCard 
                                title="Manage Inventory"
                                description="View and manage inventory items"
                                icon="📦"
                                onClick={() => onNavigate && onNavigate("inventory")}
                                color="#007bff"
                            />
                            <QuickActionCard 
                                title="Stock Movements"
                                description="Track stock movements and transactions"
                                icon="📊"
                                onClick={() => onNavigate && onNavigate("inventory-moves")}
                                color="#28a745"
                            />
                            <QuickActionCard 
                                title="Vehicle Types"
                                description="Manage vehicle types and specifications"
                                icon="🚗"
                                onClick={() => onNavigate && onNavigate("vehicle-types")}
                                color="#6f42c1"
                            />
                            <QuickActionCard 
                                title="Manage Customers"
                                description="View and manage customer accounts"
                                icon="👥"
                                onClick={() => onNavigate && onNavigate("customers")}
                                color="#17a2b8"
                            />
                            <QuickActionCard 
                                title="All Bookings"
                                description="View and manage all bookings"
                                icon="📅"
                                onClick={() => onNavigate && onNavigate("bookings")}
                                color="#ffc107"
                            />
                            <QuickActionCard 
                                title="Service Types"
                                description="Manage service types and pricing"
                                icon="🔧"
                                onClick={() => onNavigate && onNavigate("service-types")}
                                color="#fd7e14"
                            />
                        </div>
                    </div>

                    {/* Reports Section */}
                    <div>
                        <h2>Download Reports</h2>
                        <p style={{ color: "#6c757d", marginBottom: 20 }}>
                            Download comprehensive reports for analysis and record keeping
                        </p>
                        
                        <div style={{ 
                            display: "grid", 
                            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
                            gap: 20 
                        }}>
                            <ReportCard 
                                title="Inventory Report"
                                description="Complete inventory items with stock levels and reorder status"
                                icon="📦"
                                onDownload={() => downloadReport("inventory")}
                                color="#007bff"
                            />
                            <ReportCard 
                                title="Stock Movements Report"
                                description="All stock movements including receives, issues, and adjustments"
                                icon="📊"
                                onDownload={() => downloadReport("stock-movements")}
                                color="#28a745"
                            />
                            <ReportCard 
                                title="Vehicle Types Report"
                                description="All vehicle types with specifications and details"
                                icon="🚗"
                                onDownload={() => downloadReport("vehicle-types")}
                                color="#6f42c1"
                            />
                            <ReportCard 
                                title="Users Report"
                                description="All customer accounts with contact information"
                                icon="👥"
                                onDownload={() => downloadReport("users")}
                                color="#17a2b8"
                            />
                            <ReportCard 
                                title="Bookings Report"
                                description="All bookings with customer and service details"
                                icon="📅"
                                onDownload={() => downloadReport("bookings")}
                                color="#ffc107"
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

// Summary Card Component
function SummaryCard({ title, value, color, icon }) {
    return (
        <div style={{
            backgroundColor: "white",
            padding: 20,
            borderRadius: 8,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            border: "1px solid #e9ecef",
            textAlign: "center"
        }}>
            <div style={{ fontSize: "2rem", marginBottom: 10 }}>{icon}</div>
            <div style={{ fontSize: "2rem", fontWeight: "bold", color, marginBottom: 5 }}>
                {value}
            </div>
            <div style={{ color: "#6c757d", fontSize: "0.9rem" }}>{title}</div>
        </div>
    );
}

// Quick Action Card Component
function QuickActionCard({ title, description, icon, onClick, color }) {
    return (
        <div 
            onClick={onClick}
            style={{
                backgroundColor: "white",
                padding: 20,
                borderRadius: 8,
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                border: "1px solid #e9ecef",
                cursor: "pointer",
                transition: "all 0.2s ease",
                borderLeft: `4px solid ${color}`
            }}
            onMouseOver={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
            }}
            onMouseOut={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
            }}
        >
            <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: "1.5rem", marginRight: 10 }}>{icon}</span>
                <h3 style={{ margin: 0, color }}>{title}</h3>
            </div>
            <p style={{ margin: 0, color: "#6c757d", fontSize: "0.9rem" }}>{description}</p>
        </div>
    );
}

// Report Card Component
function ReportCard({ title, description, icon, onDownload, color }) {
    return (
        <div style={{
            backgroundColor: "white",
            padding: 20,
            borderRadius: 8,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            border: "1px solid #e9ecef",
            borderLeft: `4px solid ${color}`
        }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: "1.5rem", marginRight: 10 }}>{icon}</span>
                <h3 style={{ margin: 0, color }}>{title}</h3>
            </div>
            <p style={{ margin: "0 0 15px 0", color: "#6c757d", fontSize: "0.9rem" }}>
                {description}
            </p>
            <button
                onClick={onDownload}
                style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: color,
                    color: "white",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    fontWeight: "bold"
                }}
            >
                📥 Download CSV
            </button>
        </div>
    );
}
