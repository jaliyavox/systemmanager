import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const API_BASE = "http://localhost:8080";

export default function MyVehicles() {
    const { user, token } = useAuth();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [editId, setEditId] = useState(null);

    const [form, setForm] = useState({
        plateNumber: "",
        make: "",
        model: "",
        yearOfManufacture: "",
        fuelType: "PETROL"
    });

    // Load customer's vehicles
    const load = async () => {
        setLoading(true);
        setErr("");
        try {
            const res = await fetch(`${API_BASE}/api/vehicles/by-customer/${user.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setVehicles(data);
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
        setForm((f) => ({ 
            ...f, 
            [name]: name === "yearOfManufacture" ? Number(value) || "" : value 
        }));
    };

    // Create or Update vehicle
    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editId ? `${API_BASE}/api/vehicles/${editId}` : `${API_BASE}/api/vehicles`;
            const method = editId ? "PUT" : "POST";

            const body = {
                ...form,
                customerId: user.id,
                yearOfManufacture: Number(form.yearOfManufacture) || null
            };

            const res = await fetch(url, {
                method,
                headers: { 
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            setForm({ plateNumber: "", make: "", model: "", yearOfManufacture: "", fuelType: "PETROL" });
            setEditId(null);
            await load();
        } catch (e) {
            setErr(String(e.message));
        }
    };

    // Delete vehicle
    const onDelete = async (id) => {
        if (!confirm(`Delete vehicle #${id}?`)) return;
        try {
            const res = await fetch(`${API_BASE}/api/vehicles/${id}`, { 
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

    if (loading) return <p style={{ padding: 16 }}>Loading your vehicles…</p>;
    if (err) return <p style={{ color: "red", padding: 16 }}>Error: {err}</p>;

    return (
        <div style={{ padding: 16 }}>
            <h1>My Vehicles</h1>

            {/* Create / Update Vehicle Form */}
            <form onSubmit={onSubmit} style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(5, 1fr)", marginBottom: 16 }}>
                <input
                    name="plateNumber"
                    placeholder="Plate Number"
                    value={form.plateNumber}
                    onChange={onChange}
                    required
                />
                <input
                    name="make"
                    placeholder="Make (e.g., Toyota)"
                    value={form.make}
                    onChange={onChange}
                />
                <input
                    name="model"
                    placeholder="Model (e.g., Corolla)"
                    value={form.model}
                    onChange={onChange}
                />
                <input
                    name="yearOfManufacture"
                    type="number"
                    placeholder="Year"
                    value={form.yearOfManufacture}
                    onChange={onChange}
                    min="1970"
                    max="2030"
                />
                <select name="fuelType" value={form.fuelType} onChange={onChange}>
                    <option value="PETROL">Petrol</option>
                    <option value="DIESEL">Diesel</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="ELECTRIC">Electric</option>
                </select>
                <button type="submit">{editId ? "Save Update" : "Add Vehicle"}</button>
                {editId && (
                    <button
                        type="button"
                        onClick={() => {
                            setEditId(null);
                            setForm({ plateNumber: "", make: "", model: "", yearOfManufacture: "", fuelType: "PETROL" });
                        }}
                    >
                        Cancel
                    </button>
                )}
            </form>

            {vehicles.length === 0 ? (
                <p>No vehicles registered yet.</p>
            ) : (
                <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Plate Number</th>
                            <th>Make</th>
                            <th>Model</th>
                            <th>Year</th>
                            <th>Fuel Type</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vehicles.map((v) => (
                            <tr key={v.id}>
                                <td>{v.id}</td>
                                <td>{v.plateNumber || "-"}</td>
                                <td>{v.make || "-"}</td>
                                <td>{v.model || "-"}</td>
                                <td>{v.yearOfManufacture || "-"}</td>
                                <td>{v.fuelType || "-"}</td>
                                <td>
                                    <button
                                        onClick={() => {
                                            setEditId(v.id);
                                            setForm({
                                                plateNumber: v.plateNumber || "",
                                                make: v.make || "",
                                                model: v.model || "",
                                                yearOfManufacture: v.yearOfManufacture || "",
                                                fuelType: v.fuelType || "PETROL"
                                            });
                                        }}
                                        style={{ marginRight: 8 }}
                                    >
                                        Edit
                                    </button>
                                    <button onClick={() => onDelete(v.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
