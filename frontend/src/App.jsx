import { useState } from "react";
import Inventory from "./components/Inventory";
import Bookings from "./components/Bookings";

export default function App() {
    const [page, setPage] = useState("inventory");

    return (
        <div style={{ fontFamily: "system-ui, sans-serif" }}>
            <nav style={{ padding: 16, borderBottom: "1px solid #ccc", marginBottom: 16 }}>
                <button onClick={() => setPage("inventory")} style={{ marginRight: 8 }}>
                    Inventory
                </button>
                <button onClick={() => setPage("bookings")}>Bookings</button>
            </nav>

            {page === "inventory" && <Inventory />}
            {page === "bookings" && <Bookings />}
        </div>
    );
}
