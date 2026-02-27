import { useEffect, useState } from "react";
import api from "../api/http";

export default function Notifications() {
  const [items, setItems] = useState([]);

  const load = async () => {
    const res = await api.get("/notifications");
    setItems(res.data);
  };

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    load();
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h1 style={{ marginBottom: 14 }}>Notifications</h1>

      <div style={panel}>
        {items.map((n) => (
          <div key={n._id} style={{ ...row, opacity: n.read ? 0.6 : 1 }}>
            <div>
              <div style={{ fontWeight: 800 }}>
                {n.type} — {n.message}
              </div>
              <div style={{ fontSize: 12, color: "#64748b" }}>
                {new Date(n.createdAt).toLocaleString()}
              </div>
            </div>
            {!n.read && (
              <button style={btn} onClick={() => markRead(n._id)}>
                Mark read
              </button>
            )}
          </div>
        ))}
        {items.length === 0 && <div style={{ color: "#64748b" }}>No notifications</div>}
      </div>
    </div>
  );
}

const panel = {
  background: "white",
  borderRadius: 12,
  padding: 14,
  boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
};

const row = {
  display: "flex",
  justifyContent: "space-between",
  gap: 10,
  padding: 12,
  borderBottom: "1px solid #f1f5f9",
};

const btn = {
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid #e2e8f0",
  cursor: "pointer",
  background: "white",
};