import { useEffect, useState } from "react";

const API_BASE = "http://localhost:8080";

export default function Customers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [editId, setEditId] = useState(null);

    const [form, setForm] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        role: "CUSTOMER",
        enabled: true
    });

    // Load customers
    const load = async () => {
        setLoading(true);
        setErr("");
        try {
            const res = await fetch(`${API_BASE}/api/customers`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setCustomers(data);
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
        const { name, value, type, checked } = e.target;
        setForm((f) => ({ 
            ...f, 
            [name]: type === "checkbox" ? checked : value 
        }));
    };

    // Create or Update customer
    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editId ? `${API_BASE}/api/customers/${editId}` : `${API_BASE}/api/customers`;
            const method = editId ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            setForm({ fullName: "", email: "", phone: "", address: "", role: "CUSTOMER", enabled: true });
            setEditId(null);
            await load();
        } catch (e) {
            setErr(String(e.message));
        }
    };

    // Delete customer
    const onDelete = async (id) => {
        if (!confirm(`Delete customer #${id}?`)) return;
        try {
            const res = await fetch(`${API_BASE}/api/customers/${id}`, { method: "DELETE" });
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
            <h1>Customers</h1>

            {/* Create / Update Customer Form */}
            <form onSubmit={onSubmit} style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(6, 1fr)", marginBottom: 16 }}>
                <input
                    name="fullName"
                    placeholder="Full Name"
                    value={form.fullName}
                    onChange={onChange}
                    required
                />
                <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={onChange}
                    required
                />
                <input
                    name="phone"
                    placeholder="Phone"
                    value={form.phone}
                    onChange={onChange}
                />
                <input
                    name="address"
                    placeholder="Address"
                    value={form.address}
                    onChange={onChange}
                />
                <select name="role" value={form.role} onChange={onChange}>
                    <option value="CUSTOMER">CUSTOMER</option>
                    <option value="STAFF">STAFF</option>
                    <option value="ADMIN">ADMIN</option>
                </select>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                        name="enabled"
                        type="checkbox"
                        checked={form.enabled}
                        onChange={onChange}
                    />
                    <label>Enabled</label>
                </div>
                <button type="submit">{editId ? "Save Update" : "Add Customer"}</button>
                {editId && (
                    <button
                        type="button"
                        onClick={() => {
                            setEditId(null);
                            setForm({ fullName: "", email: "", phone: "", address: "", role: "CUSTOMER", enabled: true });
                        }}
                    >
                        Cancel
                    </button>
                )}
            </form>

            {customers.length === 0 ? (
                <p>No customers yet.</p>
            ) : (
                <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Address</th>
                            <th>Role</th>
                            <th>Enabled</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map((c) => (
                            <tr key={c.id}>
                                <td>{c.id}</td>
                                <td>{c.fullName || "-"}</td>
                                <td>{c.email || "-"}</td>
                                <td>{c.phone || "-"}</td>
                                <td>{c.address || "-"}</td>
                                <td>{c.role || "-"}</td>
                                <td>{c.enabled ? "Yes" : "No"}</td>
                                <td>
                                    <button
                                        onClick={() => {
                                            setEditId(c.id);
                                            setForm({
                                                fullName: c.fullName || "",
                                                email: c.email || "",
                                                phone: c.phone || "",
                                                address: c.address || "",
                                                role: c.role || "CUSTOMER",
                                                enabled: c.enabled !== false
                                            });
                                        }}
                                        style={{ marginRight: 8 }}
                                    >
                                        Edit
                                    </button>
                                    <button onClick={() => onDelete(c.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
