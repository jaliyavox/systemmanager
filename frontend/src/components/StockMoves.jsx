import { useEffect, useState } from "react";

const API_BASE = "http://localhost:8080";

export default function StockMoves({ onNavigate }) {
    const [moves, setMoves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [page, setPage] = useState(0);
    const [size] = useState(20);
    const [totalPages, setTotalPages] = useState(0);
    const [filters, setFilters] = useState({
        type: "",
        startDate: "",
        endDate: "",
        reference: ""
    });

    const loadMoves = async () => {
        setLoading(true);
        setErr("");
        try {
            let url = `${API_BASE}/api/inventory/moves?page=${page}&size=${size}`;
            
            // Add filters to URL
            const params = new URLSearchParams();
            if (filters.type) params.append("type", filters.type);
            if (filters.startDate) params.append("startDate", filters.startDate);
            if (filters.endDate) params.append("endDate", filters.endDate);
            if (filters.reference) params.append("reference", filters.reference);
            
            if (params.toString()) {
                url += "&" + params.toString();
            }

            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            
            setMoves(data.content || data);
            setTotalPages(data.totalPages || 0);
        } catch (e) {
            setErr(String(e.message));
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        setPage(0);
        loadMoves();
    };

    const clearFilters = () => {
        setFilters({ type: "", startDate: "", endDate: "", reference: "" });
        setPage(0);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const getTypeColor = (type) => {
        switch (type) {
            case "RECEIVE": return "#28a745";
            case "ISSUE": return "#dc3545";
            case "ADJUST": return "#ffc107";
            default: return "#6c757d";
        }
    };

    const getQuantityDisplay = (quantity, type) => {
        const sign = quantity > 0 ? "+" : "";
        const color = quantity > 0 ? "#28a745" : "#dc3545";
        return (
            <span style={{ color, fontWeight: "bold" }}>
                {sign}{quantity}
            </span>
        );
    };

    useEffect(() => {
        loadMoves();
    }, [page]);

    return (
        <div style={{ padding: 16, fontFamily: "system-ui, sans-serif", maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h1>Stock Movements</h1>
                <button 
                    onClick={() => onNavigate && onNavigate("inventory")}
                    style={{ padding: "8px 16px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: 4 }}
                >
                    Back to Items
                </button>
            </div>

            {/* Filters */}
            <div style={{ 
                padding: 16, 
                backgroundColor: "#f8f9fa", 
                borderRadius: 8, 
                marginBottom: 20,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 16
            }}>
                <div>
                    <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>Type</label>
                    <select
                        value={filters.type}
                        onChange={(e) => handleFilterChange("type", e.target.value)}
                        style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
                    >
                        <option value="">All Types</option>
                        <option value="RECEIVE">Receive</option>
                        <option value="ISSUE">Issue</option>
                        <option value="ADJUST">Adjust</option>
                    </select>
                </div>

                <div>
                    <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>Start Date</label>
                    <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => handleFilterChange("startDate", e.target.value)}
                        style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
                    />
                </div>

                <div>
                    <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>End Date</label>
                    <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => handleFilterChange("endDate", e.target.value)}
                        style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
                    />
                </div>

                <div>
                    <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>Reference</label>
                    <input
                        type="text"
                        value={filters.reference}
                        onChange={(e) => handleFilterChange("reference", e.target.value)}
                        placeholder="Booking ID, Job ID, etc."
                        style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
                    />
                </div>

                <div style={{ display: "flex", alignItems: "end", gap: 10 }}>
                    <button
                        onClick={applyFilters}
                        style={{ padding: "8px 16px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: 4 }}
                    >
                        Apply Filters
                    </button>
                    <button
                        onClick={clearFilters}
                        style={{ padding: "8px 16px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: 4 }}
                    >
                        Clear
                    </button>
                </div>
            </div>

            {/* Pagination Info */}
            {totalPages > 0 && (
                <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>Page {page + 1} of {totalPages}</span>
                    <div style={{ display: "flex", gap: 10 }}>
                        <button
                            onClick={() => setPage(Math.max(0, page - 1))}
                            disabled={page === 0}
                            style={{ 
                                padding: "6px 12px", 
                                backgroundColor: page === 0 ? "#e9ecef" : "#007bff", 
                                color: page === 0 ? "#6c757d" : "white", 
                                border: "none", 
                                borderRadius: 4 
                            }}
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                            disabled={page >= totalPages - 1}
                            style={{ 
                                padding: "6px 12px", 
                                backgroundColor: page >= totalPages - 1 ? "#e9ecef" : "#007bff", 
                                color: page >= totalPages - 1 ? "#6c757d" : "white", 
                                border: "none", 
                                borderRadius: 4 
                            }}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {loading ? (
                <p>Loading…</p>
            ) : err ? (
                <p style={{ color: "red" }}>Error: {err}</p>
            ) : moves.length === 0 ? (
                <p>No stock movements found.</p>
            ) : (
                <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
                    <thead>
                    <tr style={{ backgroundColor: "#f8f9fa" }}>
                        <th>Date</th>
                        <th>Item</th>
                        <th>SKU</th>
                        <th>Type</th>
                        <th>Quantity</th>
                        <th>Reference</th>
                        <th>Note</th>
                        <th>Created By</th>
                    </tr>
                    </thead>
                    <tbody>
                    {moves.map((move) => (
                        <tr key={move.id}>
                            <td>{formatDate(move.createdAt)}</td>
                            <td>{move.item?.name || "N/A"}</td>
                            <td>{move.item?.sku || "N/A"}</td>
                            <td>
                                <span style={{ 
                                    color: getTypeColor(move.type),
                                    fontWeight: "bold",
                                    padding: "4px 8px",
                                    borderRadius: 4,
                                    backgroundColor: getTypeColor(move.type) + "20"
                                }}>
                                    {move.type}
                                </span>
                            </td>
                            <td>{getQuantityDisplay(move.quantity, move.type)}</td>
                            <td>{move.reference || "-"}</td>
                            <td>{move.note || "-"}</td>
                            <td>{move.createdBy || "-"}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
