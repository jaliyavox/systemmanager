import { useEffect, useState } from "react";

const API_BASE = "http://localhost:8080";

export default function App() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [editId, setEditId] = useState(null);


    // form state
    const [form, setForm] = useState({
        itemName: "",
        category: "",
        quantity: 0,
        unitPrice: 0,
        reorderLevel: 0,
    });

    // load list
    const load = async () => {
        setLoading(true);
        setErr("");
        try {
            const res = await fetch(`${API_BASE}/api/inventory`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setItems(data);
        } catch (e) {
            setErr(String(e.message));
        } finally {
            setLoading(false);
        }
    };

    //delete function
    const onDelete = async (id) => {
        if (!confirm(`Delete item #${id}?`)) return;
        try {
            const res = await fetch(`${API_BASE}/api/inventory/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            await load(); // refresh list
        } catch (e) {
            setErr(String(e.message));
        }
    };


    useEffect(() => {
        load();
    }, []);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: name === "itemName" || name === "category" ? value : Number(value) }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setErr("");
        try {
            const url = editId
                ? `${API_BASE}/api/inventory/${editId}`
                : `${API_BASE}/api/inventory`;

            const method = editId ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            // reset & reload
            setForm({ itemName: "", category: "", quantity: 0, unitPrice: 0, reorderLevel: 0 });
            setEditId(null);
            await load();
        } catch (e) {
            setErr(String(e.message));
        }
    };

    return (
        <div style={{ padding: 16, fontFamily: "system-ui, sans-serif", maxWidth: 900, margin: "0 auto" }}>
            <h1>Inventory</h1>

            {/* Add Form */}
            <form onSubmit={onSubmit} style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(6, 1fr)", marginBottom: 16 }}>
                <input name="itemName" placeholder="Item name" value={form.itemName} onChange={onChange} required />
                <input name="category" placeholder="Category" value={form.category} onChange={onChange} required />
                <input name="quantity" type="number" placeholder="Qty" value={form.quantity} onChange={onChange} min="0" />
                <input name="unitPrice" type="number" placeholder="Unit price" value={form.unitPrice} onChange={onChange} min="0" step="0.01" />
                <input name="reorderLevel" type="number" placeholder="Reorder" value={form.reorderLevel} onChange={onChange} min="0" />
                <button type="submit">{editId ? "Save Update" : "Add"}</button>
                {editId && (
                    <button type="button" onClick={() => { setEditId(null); setForm({ itemName: "", category: "", quantity: 0, unitPrice: 0, reorderLevel: 0 }); }}>
                        Cancel
                    </button>
                )}

            </form>

            {loading ? (
                <p>Loading…</p>
            ) : err ? (
                <p style={{ color: "red" }}>Error: {err}</p>
            ) : items.length === 0 ? (
                <p>No items yet.</p>
            ) : (
                <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Item</th>
                        <th>Category</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th>Reorder Level</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {items.map((it) => (
                        <tr key={it.id}>
                            <td>{it.id}</td>
                            <td>{it.itemName}</td>
                            <td>{it.category}</td>
                            <td>{it.quantity}</td>
                            <td>{it.unitPrice}</td>
                            <td>{it.reorderLevel}</td>
                            <td>
                                <button
                                    onClick={() => {
                                        setEditId(it.id);
                                        setForm({
                                            itemName: it.itemName,
                                            category: it.category,
                                            quantity: it.quantity,
                                            unitPrice: it.unitPrice,
                                            reorderLevel: it.reorderLevel,
                                        });
                                    }}
                                    style={{ marginRight: 8 }}
                                >
                                    Edit
                                </button>
                                <button onClick={() => onDelete(it.id)}>Delete</button>
                            </td>


                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
