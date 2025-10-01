import { useEffect, useState } from "react";

const API_BASE = "http://localhost:8080";

export default function VehicleTypes() {
    const [vehicleTypes, setVehicleTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [editId, setEditId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMake, setSelectedMake] = useState("");
    const [selectedFuelType, setSelectedFuelType] = useState("");
    const [makes, setMakes] = useState([]);

    const [form, setForm] = useState({
        make: "",
        model: "",
        year: new Date().getFullYear(),
        fuelType: "",
        engineCapacity: "",
        transmission: "",
        description: ""
    });

    const fuelTypes = ["PETROL", "DIESEL", "HYBRID", "ELECTRIC"];
    const transmissions = ["MANUAL", "AUTOMATIC"];

    const load = async () => {
        setLoading(true);
        setErr("");
        try {
            const res = await fetch(`${API_BASE}/api/vehicle-types`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setVehicleTypes(data);
        } catch (e) {
            setErr(String(e.message));
        } finally {
            setLoading(false);
        }
    };

    const loadMakes = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/vehicle-types/makes`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setMakes(data);
        } catch (e) {
            console.error("Error loading makes:", e);
        }
    };

    const onDelete = async (id) => {
        if (!confirm(`Deactivate vehicle type #${id}?`)) return;
        try {
            const res = await fetch(`${API_BASE}/api/vehicle-types/${id}`, { method: "DELETE" });
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
            const res = await fetch(`${API_BASE}/api/vehicle-types/search?q=${encodeURIComponent(searchTerm)}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setVehicleTypes(data);
        } catch (e) {
            setErr(String(e.message));
        } finally {
            setLoading(false);
        }
    };

    const handleMakeFilter = async (make) => {
        setSelectedMake(make);
        if (!make) {
            await load();
            return;
        }
        
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/vehicle-types/make/${encodeURIComponent(make)}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setVehicleTypes(data);
        } catch (e) {
            setErr(String(e.message));
        } finally {
            setLoading(false);
        }
    };

    const handleFuelTypeFilter = async (fuelType) => {
        setSelectedFuelType(fuelType);
        if (!fuelType) {
            await load();
            return;
        }
        
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/vehicle-types/fuel/${encodeURIComponent(fuelType)}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setVehicleTypes(data);
        } catch (e) {
            setErr(String(e.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        loadMakes();
    }, []);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ 
            ...f, 
            [name]: name === "year" ? Number(value) : value 
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setErr("");
        try {
            const url = editId ? `${API_BASE}/api/vehicle-types/${editId}` : `${API_BASE}/api/vehicle-types`;
            const method = editId ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) {
                if (res.status === 400) {
                    setErr("Vehicle type combination already exists or invalid data");
                } else {
                    throw new Error(`HTTP ${res.status}`);
                }
                return;
            }
            setForm({ make: "", model: "", year: new Date().getFullYear(), fuelType: "", engineCapacity: "", transmission: "", description: "" });
            setEditId(null);
            await load();
        } catch (e) {
            setErr(String(e.message));
        }
    };

    const filteredTypes = vehicleTypes.filter(type => {
        const matchesSearch = !searchTerm || 
            type.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
            type.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
            type.year.toString().includes(searchTerm);
        const matchesMake = !selectedMake || type.make === selectedMake;
        const matchesFuelType = !selectedFuelType || type.fuelType === selectedFuelType;
        return matchesSearch && matchesMake && matchesFuelType;
    });

    return (
        <div style={{ padding: 16, fontFamily: "system-ui, sans-serif", maxWidth: 1200, margin: "0 auto" }}>
            <h1>Vehicle Types</h1>

            {/* Filters */}
            <div style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
                <input
                    type="text"
                    placeholder="Search by make, model, or year..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    style={{ padding: "8px", border: "1px solid #ccc", borderRadius: 4, minWidth: 200 }}
                />
                <button onClick={handleSearch} style={{ padding: "8px 16px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: 4 }}>
                    Search
                </button>
                
                <select
                    value={selectedMake}
                    onChange={(e) => handleMakeFilter(e.target.value)}
                    style={{ padding: "8px", border: "1px solid #ccc", borderRadius: 4 }}
                >
                    <option value="">All Makes</option>
                    {makes.map(make => (
                        <option key={make} value={make}>{make}</option>
                    ))}
                </select>

                <select
                    value={selectedFuelType}
                    onChange={(e) => handleFuelTypeFilter(e.target.value)}
                    style={{ padding: "8px", border: "1px solid #ccc", borderRadius: 4 }}
                >
                    <option value="">All Fuel Types</option>
                    {fuelTypes.map(fuel => (
                        <option key={fuel} value={fuel}>{fuel}</option>
                    ))}
                </select>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} style={{ 
                display: "grid", 
                gap: 8, 
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", 
                marginBottom: 16,
                padding: 16,
                backgroundColor: "#f8f9fa",
                borderRadius: 8
            }}>
                <input name="make" placeholder="Make" value={form.make} onChange={onChange} required />
                <input name="model" placeholder="Model" value={form.model} onChange={onChange} required />
                <input name="year" type="number" placeholder="Year" value={form.year} onChange={onChange} min="1900" max="2030" required />
                <select name="fuelType" value={form.fuelType} onChange={onChange} required>
                    <option value="">Fuel Type</option>
                    {fuelTypes.map(fuel => (
                        <option key={fuel} value={fuel}>{fuel}</option>
                    ))}
                </select>
                <input name="engineCapacity" placeholder="Engine (e.g., 1.6L)" value={form.engineCapacity} onChange={onChange} />
                <select name="transmission" value={form.transmission} onChange={onChange}>
                    <option value="">Transmission</option>
                    {transmissions.map(trans => (
                        <option key={trans} value={trans}>{trans}</option>
                    ))}
                </select>
                <textarea name="description" placeholder="Description" value={form.description} onChange={onChange} rows="1" />
                <button type="submit">{editId ? "Update" : "Add"}</button>
                {editId && (
                    <button
                        type="button"
                        onClick={() => {
                            setEditId(null);
                            setForm({ make: "", model: "", year: new Date().getFullYear(), fuelType: "", engineCapacity: "", transmission: "", description: "" });
                        }}
                    >
                        Cancel
                    </button>
                )}
            </form>

            {err && (
                <div style={{ padding: 10, backgroundColor: "#f8d7da", color: "#721c24", borderRadius: 4, marginBottom: 16 }}>
                    Error: {err}
                </div>
            )}

            {loading ? (
                <p>Loading…</p>
            ) : filteredTypes.length === 0 ? (
                <p>No vehicle types found.</p>
            ) : (
                <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
                    <thead>
                    <tr style={{ backgroundColor: "#f8f9fa" }}>
                        <th>ID</th>
                        <th>Make</th>
                        <th>Model</th>
                        <th>Year</th>
                        <th>Fuel Type</th>
                        <th>Engine</th>
                        <th>Transmission</th>
                        <th>Description</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredTypes.map((type) => (
                        <tr key={type.id}>
                            <td>{type.id}</td>
                            <td>{type.make}</td>
                            <td>{type.model}</td>
                            <td>{type.year}</td>
                            <td>
                                <span style={{ 
                                    padding: "4px 8px", 
                                    borderRadius: 4, 
                                    backgroundColor: "#e9ecef",
                                    fontSize: "12px"
                                }}>
                                    {type.fuelType}
                                </span>
                            </td>
                            <td>{type.engineCapacity || "-"}</td>
                            <td>{type.transmission || "-"}</td>
                            <td>{type.description || "-"}</td>
                            <td>
                                <button
                                    onClick={() => {
                                        setEditId(type.id);
                                        setForm({
                                            make: type.make,
                                            model: type.model,
                                            year: type.year,
                                            fuelType: type.fuelType,
                                            engineCapacity: type.engineCapacity || "",
                                            transmission: type.transmission || "",
                                            description: type.description || "",
                                        });
                                    }}
                                    style={{ marginRight: 8, padding: "4px 8px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: 3 }}
                                >
                                    Edit
                                </button>
                                <button 
                                    onClick={() => onDelete(type.id)}
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
        </div>
    );
}
