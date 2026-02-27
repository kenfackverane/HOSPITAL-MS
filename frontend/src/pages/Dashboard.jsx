import { useEffect, useMemo, useState } from "react";
import api from "../api/http";

export default function Dashboard() {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [billing, setBilling] = useState({ paid: 0, unpaid: 0 });

  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState(null);
  const [errMsg, setErrMsg] = useState("");

  const fetchAll = async () => {
    setErrMsg("");
    try {
      setLoading(true);

      // On charge tout en parallèle (plus rapide)
      const results = await Promise.allSettled([
        api.get("/patients"),
        api.get("/doctors"),
        api.get("/appointments"),
        api.get("/invoices/stats"),
      ]);

      const [pRes, dRes, aRes, bRes] = results;

      if (pRes.status === "fulfilled") setPatients(pRes.value.data || []);
      if (dRes.status === "fulfilled") setDoctors(dRes.value.data || []);
      if (aRes.status === "fulfilled") setAppointments(aRes.value.data || []);
      if (bRes.status === "fulfilled") setBilling(bRes.value.data || { paid: 0, unpaid: 0 });

      // Si au moins un call a échoué, on affiche une alerte soft
      const hasError = results.some((r) => r.status === "rejected");
      if (hasError) setErrMsg("⚠️ Certaines données n’ont pas pu se charger (backend).");

      setLastSync(new Date());
    } catch (e) {
      setErrMsg("❌ Impossible de charger le dashboard (backend?)");
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Auto-refresh (simulation live)
  useEffect(() => {
    fetchAll(); // 1er chargement
    const t = setInterval(fetchAll, 5000); // toutes les 5s
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Stats dynamiques calculées
  const stats = useMemo(() => {
    const totalPatients = patients.length;
    const totalDoctors = doctors.length;
    const totalAppointments = appointments.length;

    const todayISO = new Date().toISOString().slice(0, 10);
    const todayAppointments = appointments.filter((a) => a.date === todayISO).length;

    const revenueToday = Number(billing.paid || 0);
    const unpaidTotal = Number(billing.unpaid || 0);

    return [
      { title: "Patients", value: totalPatients, sub: "Total enregistrés" },
      { title: "Doctors", value: totalDoctors, sub: "Total enregistrés" },
      { title: "Appointments", value: totalAppointments, sub: `Aujourd’hui: ${todayAppointments}` },
      { title: "Revenue (Paid)", value: formatMoney(revenueToday), sub: `Unpaid: ${formatMoney(unpaidTotal)}` },
    ];
  }, [patients, doctors, appointments, billing]);

  // ✅ Derniers RDV (trié par date/time si possible)
  const recentAppointments = useMemo(() => {
    const list = [...appointments];
    // Tri robuste: date desc + time desc
    list.sort((a, b) => {
      const da = `${a.date || ""} ${a.time || ""}`.trim();
      const db = `${b.date || ""} ${b.time || ""}`.trim();
      return db.localeCompare(da);
    });
    return list.slice(0, 8);
  }, [appointments]);

  return (
    <div style={styles.page}>
      <div style={styles.topRow}>
        <div>
          <h1 style={styles.h1}>Dashboard</h1>
          <p style={styles.sub}>
            Simulation en temps réel (auto-refresh 5s)
            {lastSync ? ` • Dernière mise à jour: ${lastSync.toLocaleTimeString()}` : ""}
          </p>
        </div>

        <button style={styles.btn} onClick={fetchAll}>
          🔄 Refresh
        </button>
      </div>

      {errMsg ? <div style={styles.warn}>{errMsg}</div> : null}

      {/* Cards */}
      <div style={styles.gridCards}>
        {stats.map((s) => (
          <div key={s.title} style={styles.card}>
            <div style={styles.cardTitle}>{s.title}</div>
            <div style={styles.cardValue}>{loading ? "…" : s.value}</div>
            <div style={styles.cardSub}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Bottom panels */}
      <div style={styles.bottomGrid}>
        <div style={styles.panel}>
          <div style={styles.panelHead}>
            <h3 style={{ margin: 0 }}>Recent Appointments</h3>
            <span style={styles.miniBadge}>
              {appointments.length} total
            </span>
          </div>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Patient</th>
                <th style={styles.th}>Doctor</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Time</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>

            <tbody>
              {recentAppointments.map((a) => (
                <tr key={a._id}>
                  <td style={styles.td}>{a.patientName || "-"}</td>
                  <td style={styles.td}>{a.doctorName || "-"}</td>
                  <td style={styles.td}>{a.date || "-"}</td>
                  <td style={styles.td}>{a.time || "-"}</td>
                  <td style={styles.td}>
                    <span style={badge(a.status)}>{a.status || "—"}</span>
                  </td>
                </tr>
              ))}

              {!loading && recentAppointments.length === 0 && (
                <tr>
                  <td style={styles.empty} colSpan={5}>
                    Aucun rendez-vous pour l’instant.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={styles.panel}>
          <h3 style={{ marginTop: 0 }}>Today Overview</h3>

          <div style={styles.kpiLine}>
            <span style={styles.kpiLabel}>Patients total</span>
            <span style={styles.kpiValue}>{patients.length}</span>
          </div>

          <div style={styles.kpiLine}>
            <span style={styles.kpiLabel}>Appointments today</span>
            <span style={styles.kpiValue}>{appointments.filter((a) => a.date === todayISO()).length}</span>
          </div>

          <div style={styles.kpiLine}>
            <span style={styles.kpiLabel}>Paid total</span>
            <span style={styles.kpiValue}>{formatMoney(Number(billing.paid || 0))}</span>
          </div>

          <div style={styles.kpiLine}>
            <span style={styles.kpiLabel}>Unpaid total</span>
            <span style={styles.kpiValue}>{formatMoney(Number(billing.unpaid || 0))}</span>
          </div>

          <div style={styles.note}>
            💡 Quand tu ajoutes un patient / rdv / facture, tu verras les chiffres monter automatiquement.
          </div>
        </div>
      </div>
    </div>
  );
}

/* helpers */
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// Ici on affiche en FCFA par défaut (tu peux adapter selon settings)
function formatMoney(n) {
  const num = Number(n || 0);
  return `${num.toLocaleString("fr-FR")} FCFA`;
}

function badge(status) {
  let bg = "#e5e7eb";
  let color = "#111827";

  if (status === "CONFIRMED") {
    bg = "#dcfce7";
    color = "#166534";
  } else if (status === "PENDING") {
    bg = "#fef9c3";
    color = "#854d0e";
  } else if (status === "DONE") {
    bg = "#dbeafe";
    color = "#1e40af";
  } else if (status === "CANCELLED") {
    bg = "#fee2e2";
    color = "#991b1b";
  }

  return {
    background: bg,
    color,
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
    display: "inline-block",
  };
}

/* styles */
const styles = {
  page: { padding: 8 },

  topRow: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 14,
  },
  h1: { margin: 0, fontSize: 26 },
  sub: { margin: "6px 0 0", color: "#6b7280", fontSize: 13 },

  btn: {
    border: "1px solid #e5e7eb",
    background: "#fff",
    padding: "10px 12px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 800,
  },

  warn: {
    border: "1px solid #fde68a",
    background: "#fffbeb",
    color: "#92400e",
    padding: 12,
    borderRadius: 12,
    fontWeight: 800,
    marginBottom: 14,
  },

  gridCards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 14,
    marginBottom: 14,
  },

  card: {
    background: "white",
    borderRadius: 12,
    padding: 14,
    border: "1px solid #e5e7eb",
    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
  },
  cardTitle: { color: "#6b7280", fontWeight: 800, fontSize: 13 },
  cardValue: { marginTop: 10, fontSize: 26, fontWeight: 900, color: "#111827" },
  cardSub: { marginTop: 6, color: "#64748b", fontSize: 12, fontWeight: 700 },

  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: 14,
    alignItems: "start",
  },

  panel: {
    background: "white",
    borderRadius: 12,
    padding: 14,
    border: "1px solid #e5e7eb",
    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
    overflowX: "auto",
  },

  panelHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10,
  },

  miniBadge: {
    background: "#f1f5f9",
    border: "1px solid #e2e8f0",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    color: "#0f172a",
  },

  table: { width: "100%", borderCollapse: "collapse", minWidth: 560 },
  th: {
    textAlign: "left",
    borderBottom: "1px solid #e5e7eb",
    padding: "10px 8px",
    color: "#334155",
    fontWeight: 800,
    fontSize: 12,
  },
  td: {
    borderBottom: "1px solid #f1f5f9",
    padding: "10px 8px",
    color: "#0f172a",
    fontWeight: 600,
    fontSize: 13,
  },
  empty: { padding: 14, color: "#64748b", fontWeight: 700 },

  kpiLine: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px dashed #e5e7eb",
    gap: 10,
  },
  kpiLabel: { color: "#64748b", fontWeight: 800 },
  kpiValue: { color: "#0f172a", fontWeight: 900 },

  note: {
    marginTop: 12,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    padding: 12,
    borderRadius: 12,
    color: "#334155",
    fontWeight: 700,
    fontSize: 13,
  },
};