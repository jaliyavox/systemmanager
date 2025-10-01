import { useEffect, useState } from "react";

const API_BASE = "http://localhost:8080";

export default function InventoryItems({ onNavigate }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [categories, setCategories] = useState([]);
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [showStockDrawer, setShowStockDrawer] = useState(false);

    const load = async () => {
        setLoading(true);
        setErr("");
        try {
            const res = await fetch(`${API_BASE}/api/inventory/items`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setItems(data);
        } catch (e) {
            setErr(String(e.message));
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/inventory/categories`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setCategories(data);
        } catch (e) {
            console.error("Error loading categories:", e);
        }
    };

    const onDelete = async (id) => {
        if (!confirm(`Deactivate item #${id}?`)) return;
        try {
            const res = await fetch(`${API_BASE}/api/inventory/items/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            await load();
        } catch (e) {
            setErr(String(e.message));
        }
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            await load();
            return;
        }
        
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/inventory/items/search?q=${encodeURIComponent(searchTerm)}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setItems(data);
        } catch (e) {
            setErr(String(e.message));
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryFilter = async (category) => {
        setSelectedCategory(category);
        if (!category) {
            await load();
            return;
        }
        
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/inventory/items/category/${encodeURIComponent(category)}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setItems(data);
        } catch (e) {
            setErr(String(e.message));
        } finally {
            setLoading(false);
        }
    };

    const handleSelectItem = (itemId) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(itemId)) {
            newSelected.delete(itemId);
        } else {
            newSelected.add(itemId);
        }
        setSelectedItems(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedItems.size === items.length) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(items.map(item => item.id)));
        }
    };

    const exportCSV = () => {
        const csvContent = [
            ["SKU", "Name", "Category", "On Hand", "Min Qty", "Unit Price", "Reorder Status"],
            ...items.map(item => [
                item.sku,
                item.name,
                item.category,
                item.onHand,
                item.minQty,
                item.unitPrice || 0,
                item.onHand <= item.minQty ? "Low Stock" : "OK"
            ])
        ].map(row => row.join(",")).join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "inventory-items.csv";
        a.click();
        window.URL.revokeObjectURL(url);
    };

    useEffect(() => {
        load();
        loadCategories();
    }, []);

    const filteredItems = items.filter(item => {
        const matchesSearch = !searchTerm || 
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div style={{ padding: 16, fontFamily: "system-ui, sans-serif", maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h1>Inventory Items</h1>
                <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => onNavigate && onNavigate("inventory-new")} style={{ padding: "8px 16px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: 4 }}>
                        New Item
                    </button>
                    <button onClick={() => onNavigate && onNavigate("inventory-moves")} style={{ padding: "8px 16px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: 4 }}>
                        Stock Moves
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "center" }}>
                <input
                    type="text"
                    placeholder="Search by name or SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    style={{ padding: "8px", border: "1px solid #ccc", borderRadius: 4, minWidth: 200 }}
                />
                <button onClick={handleSearch} style={{ padding: "8px 16px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: 4 }}>
                    Search
                </button>
                
                <select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryFilter(e.target.value)}
                    style={{ padding: "8px", border: "1px solid #ccc", borderRadius: 4 }}
                >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            {/* Bulk Actions */}
            {selectedItems.size > 0 && (
                <div style={{ marginBottom: 20, padding: 10, backgroundColor: "#f8f9fa", borderRadius: 4 }}>
                    <span style={{ marginRight: 10 }}>{selectedItems.size} item(s) selected</span>
                    <button 
                        onClick={() => setShowStockDrawer(true)}
                        style={{ padding: "6px 12px", backgroundColor: "#ffc107", color: "black", border: "none", borderRadius: 4, marginRight: 8 }}
                    >
                        Adjust Stock
                    </button>
                    <button 
                        onClick={() => setSelectedItems(new Set())}
                        style={{ padding: "6px 12px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: 4 }}
                    >
                        Clear Selection
                    </button>
                </div>
            )}

            {/* Export Button */}
            <div style={{ marginBottom: 20 }}>
                <button onClick={exportCSV} style={{ padding: "8px 16px", backgroundColor: "#17a2b8", color: "white", border: "none", borderRadius: 4 }}>
                    Export CSV
                </button>
            </div>

            {loading ? (
                <p>Loading…</p>
            ) : err ? (
                <p style={{ color: "red" }}>Error: {err}</p>
            ) : filteredItems.length === 0 ? (
                <p>No items found.</p>
            ) : (
                <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
                    <thead>
                    <tr style={{ backgroundColor: "#f8f9fa" }}>
                        <th>
                            <input
                                type="checkbox"
                                checked={selectedItems.size === items.length && items.length > 0}
                                onChange={handleSelectAll}
                            />
                        </th>
                        <th>SKU</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>On Hand</th>
                        <th>Min Qty</th>
                        <th>Unit Price</th>
                        <th>Reorder Status</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredItems.map((item) => (
                        <tr 
                            key={item.id}
                            style={{ 
                                backgroundColor: item.onHand <= item.minQty ? "#fff3cd" : "white",
                                cursor: "pointer"
                            }}
                            onClick={() => handleSelectItem(item.id)}
                        >
                            <td>
                                <input
                                    type="checkbox"
                                    checked={selectedItems.has(item.id)}
                                    onChange={() => handleSelectItem(item.id)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </td>
                            <td>{item.sku}</td>
                            <td>{item.name}</td>
                            <td>{item.category}</td>
                            <td style={{ fontWeight: item.onHand <= item.minQty ? "bold" : "normal" }}>
                                {item.onHand}
                            </td>
                            <td>{item.minQty}</td>
                            <td>${item.unitPrice || 0}</td>
                            <td>
                                <span style={{ 
                                    color: item.onHand <= item.minQty ? "#dc3545" : "#28a745",
                                    fontWeight: "bold"
                                }}>
                                    {item.onHand <= item.minQty ? "Low Stock" : "OK"}
                                </span>
                            </td>
                            <td onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={() => onNavigate && onNavigate("inventory-edit")}
                                    style={{ marginRight: 8, padding: "4px 8px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: 3 }}
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => setShowStockDrawer(true)}
                                    style={{ marginRight: 8, padding: "4px 8px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: 3 }}
                                >
                                    Stock
                                </button>
                                <button 
                                    onClick={() => onDelete(item.id)}
                                    style={{ padding: "4px 8px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: 3 }}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}

            {/* Stock Drawer */}
            {showStockDrawer && (
                <StockDrawer 
                    items={Array.from(selectedItems).map(id => items.find(item => item.id === id)).filter(Boolean)}
                    onClose={() => setShowStockDrawer(false)}
                    onSuccess={() => {
                        setShowStockDrawer(false);
                        setSelectedItems(new Set());
                        load();
                    }}
                />
            )}
        </div>
    );
}

// Stock Drawer Component
function StockDrawer({ items, onClose, onSuccess }) {
    const [moveType, setMoveType] = useState("RECEIVE");
    const [quantity, setQuantity] = useState("");
    const [reference, setReference] = useState("");
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!quantity || quantity <= 0) return;

        setLoading(true);
        try {
            for (const item of items) {
                const moveData = {
                    item: { id: item.id },
                    quantity: parseInt(quantity),
                    type: moveType,
                    reference: reference,
                    note: note,
                    createdBy: "current_user" // TODO: Get from auth context
                };

                const res = await fetch(`${API_BASE}/api/inventory/moves`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(moveData)
                });

                if (!res.ok) throw new Error(`HTTP ${res.status}`);
            }
            
            onSuccess();
        } catch (e) {
            alert("Error processing stock move: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: "white",
                padding: 20,
                borderRadius: 8,
                minWidth: 400,
                maxHeight: "80vh",
                overflow: "auto"
            }}>
                <h3>Stock Movement</h3>
                <p>Processing {items.length} item(s)</p>
                
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 15 }}>
                        <label>Type:</label>
                        <div style={{ display: "flex", gap: 10, marginTop: 5 }}>
                            <label>
                                <input
                                    type="radio"
                                    value="RECEIVE"
                                    checked={moveType === "RECEIVE"}
                                    onChange={(e) => setMoveType(e.target.value)}
                                />
                                Receive
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    value="ISSUE"
                                    checked={moveType === "ISSUE"}
                                    onChange={(e) => setMoveType(e.target.value)}
                                />
                                Issue
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    value="ADJUST"
                                    checked={moveType === "ADJUST"}
                                    onChange={(e) => setMoveType(e.target.value)}
                                />
                                Adjust
                            </label>
                        </div>
                    </div>

                    <div style={{ marginBottom: 15 }}>
                        <label>Quantity:</label>
                        <input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            required
                            min="1"
                            style={{ width: "100%", padding: 8, marginTop: 5 }}
                        />
                    </div>

                    <div style={{ marginBottom: 15 }}>
                        <label>Reference:</label>
                        <input
                            type="text"
                            value={reference}
                            onChange={(e) => setReference(e.target.value)}
                            placeholder="Booking ID, Job ID, etc."
                            style={{ width: "100%", padding: 8, marginTop: 5 }}
                        />
                    </div>

                    <div style={{ marginBottom: 15 }}>
                        <label>Note:</label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Additional notes..."
                            style={{ width: "100%", padding: 8, marginTop: 5, minHeight: 60 }}
                        />
                    </div>

                    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{ padding: "8px 16px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: 4 }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{ padding: "8px 16px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: 4 }}
                        >
                            {loading ? "Processing..." : "Submit"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
