import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const API_BASE = "http://localhost:8080";

export default function MyBookings() {
    const { user, token } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [serviceTypes, setServiceTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [editId, setEditId] = useState(null);

    const [form, setForm] = useState({
        locationId: "",
        vehicleId: "",
        type: "SERVICE",
        startTime: "",
        endTime: "",
        serviceTypeId: "",
        status: "PENDING",
    });

    // Load customer's bookings, vehicles, and service types
    const load = async () => {
        setLoading(true);
        setErr("");
        try {
            const [bookingsRes, vehiclesRes, serviceTypesRes] = await Promise.all([
                fetch(`${API_BASE}/api/customers/${user.id}/bookings`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_BASE}/api/vehicles/by-customer/${user.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_BASE}/api/service-types`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);
            
            if (!bookingsRes.ok) {
                const errorText = await bookingsRes.text();
                throw new Error(`Bookings HTTP ${bookingsRes.status}: ${errorText}`);
            }
            if (!vehiclesRes.ok) {
                const errorText = await vehiclesRes.text();
                throw new Error(`Vehicles HTTP ${vehiclesRes.status}: ${errorText}`);
            }
            if (!serviceTypesRes.ok) {
                const errorText = await serviceTypesRes.text();
                throw new Error(`Service Types HTTP ${serviceTypesRes.status}: ${errorText}`);
            }
            
            const [bookingsData, vehiclesData, serviceTypesData] = await Promise.all([
                bookingsRes.json(),
                vehiclesRes.json(),
                serviceTypesRes.json()
            ]);
            
            setBookings(bookingsData);
            setVehicles(vehiclesData);
            setServiceTypes(serviceTypesData);
        } catch (e) {
            setErr(String(e.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            load();
        }
    }, [user]);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    // Create booking
    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editId ? `${API_BASE}/api/customers/${user.id}/bookings/${editId}` : `${API_BASE}/api/customers/${user.id}/bookings`;
            const method = editId ? "PUT" : "POST";

            const body = {
                locationId: Number(form.locationId),
                vehicleId: Number(form.vehicleId),
                type: form.type,
                startTime: form.startTime,
                endTime: form.endTime,
                status: form.status,
                ...(form.serviceTypeId && { serviceTypeId: Number(form.serviceTypeId) })
            };

            const res = await fetch(url, {
                method,
                headers: { 
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`HTTP ${res.status}: ${errorText}`);
            }

            setForm({ locationId: "", vehicleId: "", type: "SERVICE", startTime: "", endTime: "", serviceTypeId: "", status: "PENDING" });
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
            const res = await fetch(`${API_BASE}/api/customers/${user.id}/bookings/${id}`, { 
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            await load();
        } catch (e) {
            setErr(String(e.message));
        }
    };

    if (loading) return <p style={{ padding: 16 }}>Loading your bookings…</p>;
    if (err) return <p style={{ color: "red", padding: 16 }}>Error: {err}</p>;

    return (
        <div style={{ padding: 16 }}>
            <h1>My Bookings</h1>

            {/* Create Booking Form */}
            <form onSubmit={onSubmit} style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(6, 1fr)", marginBottom: 16 }}>
                <input
                    name="locationId"
                    type="number"
                    min="1"
                    placeholder="Location ID"
                    value={form.locationId}
                    onChange={onChange}
                    required
                />
                <select name="vehicleId" value={form.vehicleId} onChange={onChange} required>
                    <option value="">Select Vehicle</option>
                    {vehicles.map(v => (
                        <option key={v.id} value={v.id}>
                            {v.plateNumber} - {v.make} {v.model}
                        </option>
                    ))}
                </select>
                <select name="type" value={form.type} onChange={onChange}>
                    <option value="SERVICE">SERVICE</option>
                    <option value="FUEL">FUEL</option>
                </select>
                <input
                    name="startTime"
                    type="datetime-local"
                    value={form.startTime}
                    onChange={onChange}
                    required
                />
                <input
                    name="endTime"
                    type="datetime-local"
                    value={form.endTime}
                    onChange={onChange}
                    required
                />
                <select name="serviceTypeId" value={form.serviceTypeId} onChange={onChange}>
                    <option value="">Select Service (Optional)</option>
                    {serviceTypes.map(st => (
                        <option key={st.id} value={st.id}>
                            {st.name} - ${st.price}
                        </option>
                    ))}
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
                            setForm({ locationId: "", vehicleId: "", type: "SERVICE", startTime: "", endTime: "", serviceTypeId: "", status: "PENDING" });
                        }}
                    >
                        Cancel
                    </button>
                )}
            </form>

            {bookings.length === 0 ? (
                <p>No bookings yet.</p>
            ) : (
                <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Location</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Start Time</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((b) => (
                            <tr key={b.id}>
                                <td>{b.id}</td>
                                <td>{b.locationId ?? "-"}</td>
                                <td>{b.type ?? "-"}</td>
                                <td>{b.status ?? "-"}</td>
                                <td>{b.startTime ?? "-"}</td>
                                <td>
                                    <button
                                        onClick={() => {
                                            setEditId(b.id);
                                            setForm({
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
