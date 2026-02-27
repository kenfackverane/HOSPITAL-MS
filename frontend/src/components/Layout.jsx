import Sidebar from "./Sidebar.jsx";

export default function Layout({ children }) {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <main className="container" style={{ flex: 1 }}>
        {/* Barre du haut (comme la capture) */}
        <div className="topbar">
          <div className="topbar-title">
            <span style={{ fontSize: 18 }}>🏥</span>
            <span>Hospital Admin Panel</span>
          </div>

          {/* à droite : petite zone user */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ color: "#64748b" }}>🔔</span>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 999,
                background: "#e2e8f0",
                display: "grid",
                placeItems: "center",
                fontWeight: 900,
                color: "#334155",
              }}
            >
              U
            </div>
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}
