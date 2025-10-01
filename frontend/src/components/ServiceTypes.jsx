import { useEffect, useState } from "react";

const API_BASE = "http://localhost:8080";

export default function ServiceTypes() {
    const [serviceTypes, setServiceTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [editId, setEditId] = useState(null);

    const [form, setForm] = useState({
        code: "",
        name: "",
        label: "",
        description: "",
        basePrice: 0,
        price: 0
    });

    // Load service types
    const load = async () => {
        setLoading(true);
        setErr("");
        try {
            const res = await fetch(`${API_BASE}/api/service-types`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setServiceTypes(data);
        } catch (e) {
            setErr(String(e.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ 
            ...f, 
            [name]: name === "basePrice" || name === "price" ? Number(value) || 0 : value 
        }));
    };

    // Create or Update service type
    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editId ? `${API_BASE}/api/service-types/${editId}` : `${API_BASE}/api/service-types`;
            const method = editId ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            setForm({ code: "", name: "", label: "", description: "", basePrice: 0, price: 0 });
            setEditId(null);
            await load();
        } catch (e) {
            setErr(String(e.message));
        }
    };

    // Delete service type
    const onDelete = async (id) => {
        if (!confirm(`Delete service type #${id}?`)) return;
        try {
            const res = await fetch(`${API_BASE}/api/service-types/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            await load();
        } catch (e) {
            setErr(String(e.message));
        }
    };

    if (loading) return <p style={{ padding: 16 }}>Loading…</p>;
    if (err) return <p style={{ color: "red", padding: 16 }}>Error: {err}</p>;

    return (
        <div style={{ padding: 16 }}>
            <h1>Service Types</h1>

            {/* Create / Update Service Type Form */}
            <form onSubmit={onSubmit} style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(6, 1fr)", marginBottom: 16 }}>
                <input
                    name="code"
                    placeholder="Code (e.g., OIL_CHANGE)"
                    value={form.code}
                    onChange={onChange}
                    required
                />
                <input
                    name="name"
                    placeholder="Name (e.g., Oil Change)"
                    value={form.name}
                    onChange={onChange}
                    required
                />
                <input
                    name="label"
                    placeholder="Label (e.g., Standard Oil Change)"
                    value={form.label}
                    onChange={onChange}
                />
                <input
                    name="description"
                    placeholder="Description"
                    value={form.description}
                    onChange={onChange}
                />
                <input
                    name="basePrice"
                    type="number"
                    placeholder="Base Price"
                    value={form.basePrice}
                    onChange={onChange}
                    min="0"
                    step="0.01"
                />
                <input
                    name="price"
                    type="number"
                    placeholder="Current Price"
                    value={form.price}
                    onChange={onChange}
                    min="0"
                    step="0.01"
                />
                <button type="submit">{editId ? "Save Update" : "Add Service Type"}</button>
                {editId && (
                    <button
                        type="button"
                        onClick={() => {
                            setEditId(null);
                            setForm({ code: "", name: "", label: "", description: "", basePrice: 0, price: 0 });
                        }}
                    >
                        Cancel
                    </button>
                )}
            </form>

            {serviceTypes.length === 0 ? (
                <p>No service types yet.</p>
            ) : (
                <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Code</th>
                            <th>Name</th>
                            <th>Label</th>
                            <th>Description</th>
                            <th>Base Price</th>
                            <th>Current Price</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {serviceTypes.map((st) => (
                            <tr key={st.id}>
                                <td>{st.id}</td>
                                <td>{st.code || "-"}</td>
                                <td>{st.name || "-"}</td>
                                <td>{st.label || "-"}</td>
                                <td>{st.description || "-"}</td>
                                <td>${st.basePrice || 0}</td>
                                <td>${st.price || 0}</td>
                                <td>
                                    <button
                                        onClick={() => {
                                            setEditId(st.id);
                                            setForm({
                                                code: st.code || "",
                                                name: st.name || "",
                                                label: st.label || "",
                                                description: st.description || "",
                                                basePrice: st.basePrice || 0,
                                                price: st.price || 0
                                            });
                                        }}
                                        style={{ marginRight: 8 }}
                                    >
                                        Edit
                                    </button>
                                    <button onClick={() => onDelete(st.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
