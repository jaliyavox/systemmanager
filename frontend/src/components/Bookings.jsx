import { useEffect, useState } from "react";

const API_BASE = "http://localhost:8080";

export default function Bookings() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [editId, setEditId] = useState(null);

    const [form, setForm] = useState({
        customerId: "",
        locationId: "",
        type: "SERVICE",
        startTime: "",
        status: "PENDING",
    });

    // Load bookings
    const load = async () => {
        setLoading(true);
        setErr("");
        try {
            const base = form.customerId ? `${API_BASE}/api/customers/${Number(form.customerId)}/bookings` : `${API_BASE}/api/bookings`;
            const res = await fetch(base);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setRows(data);
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
        setForm((f) => ({ ...f, [name]: value }));
    };

    // Create or Update booking
    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const base = `${API_BASE}/api/customers/${Number(form.customerId)}/bookings`;
            const url = editId ? `${base}/${editId}` : base;
            const method = editId ? "PUT" : "POST";

            const body = {
                ...form,
                customerId: Number(form.customerId),
                locationId: Number(form.locationId),
            };

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            setForm({ customerId: "", locationId: "", type: "SERVICE", startTime: "", status: "PENDING" });
            setEditId(null);
            await load();
        } catch (e) {
            setErr(String(e.message));
        }
    };

    // Delete booking
    const onDelete = async (id) => {
        if (!confirm(`Delete booking #${id}?`)) return;
        try {
            const baseScoped = form.customerId ? `${API_BASE}/api/customers/${Number(form.customerId)}/bookings/${id}` : null;
            const url = baseScoped ?? `${API_BASE}/api/bookings/${id}`;
            const res = await fetch(url, { method: "DELETE" });
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
            <h1>Bookings</h1>

            {/* Create / Update Booking Form */}
            <form onSubmit={onSubmit} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <input
                    name="customerId"
                    type="number"
                    min="1"
                    placeholder="Customer ID"
                    value={form.customerId}
                    onChange={onChange}
                    required
                />
                <input
                    name="locationId"
                    type="number"
                    min="1"
                    placeholder="Location ID"
                    value={form.locationId}
                    onChange={onChange}
                    required
                />
                <input
                    name="startTime"
                    placeholder="YYYY-MM-DDTHH:mm:ss"
                    value={form.startTime}
                    onChange={onChange}
                    required
                />
                <select name="type" value={form.type} onChange={onChange}>
                    <option value="SERVICE">SERVICE</option>
                    <option value="FUEL">FUEL</option>
                </select>
                <select name="status" value={form.status} onChange={onChange}>
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                </select>
                <button type="submit">{editId ? "Save Update" : "Add Booking"}</button>
                {editId && (
                    <button
                        type="button"
                        onClick={() => {
                            setEditId(null);
                            setForm({ customerId: "", locationId: "", type: "SERVICE", startTime: "", status: "PENDING" });
                        }}
                    >
                        Cancel
                    </button>
                )}
            </form>

            {rows.length === 0 ? (
                <p>No bookings yet.</p>
            ) : (
                <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Customer</th>
                        <th>Location</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Start</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {rows.map((b) => (
                        <tr key={b.id}>
                            <td>{b.id}</td>
                            <td>{b.customerId ?? "-"}</td>
                            <td>{b.locationId ?? "-"}</td>
                            <td>{b.type ?? "-"}</td>
                            <td>{b.status ?? "-"}</td>
                            <td>{b.startTime ?? "-"}</td>
                            <td>
                                <button
                                    onClick={() => {
                                        setEditId(b.id);
                                        setForm({
                                            customerId: b.customerId ?? "",
                                            locationId: b.locationId ?? "",
                                            type: b.type ?? "SERVICE",
                                            startTime: b.startTime ?? "",
                                            status: b.status ?? "PENDING",
                                        });
                                    }}
                                    style={{ marginRight: 8 }}
                                >
                                    Edit
                                </button>
                                <button onClick={() => onDelete(b.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
