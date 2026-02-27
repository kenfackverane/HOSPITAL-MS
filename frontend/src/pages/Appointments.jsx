import { useEffect, useMemo, useState } from "react";
import api from "../api/http";
import { emitRefresh, onRefresh } from "../utils/bus";

export default function Appointments() {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [form, setForm] = useState({
    patientId: "",
    doctorId: "",
    date: "",
    time: "",
    status: "PENDING",
    reason: "",
  });

  const [loading, setLoading] = useState(false);

  const loadPatients = async () => {
    const res = await api.get("/patients");
    setPatients(res.data || []);
  };

  const loadDoctors = async () => {
    const res = await api.get("/doctors");
    setDoctors(res.data || []);
  };

  const loadAppointments = async () => {
    const res = await api.get("/appointments");
    setAppointments(res.data || []);
  };

  const loadAll = async () => {
    try {
      await Promise.all([loadPatients(), loadDoctors(), loadAppointments()]);
      // auto select if empty
      setForm((p) => ({
        ...p,
        patientId: p.patientId || (patients[0]?._id || ""),
        doctorId: p.doctorId || (doctors[0]?._id || ""),
      }));
    } catch (e) {
      console.log(e);
      alert("❌ Backend non disponible ?");
    }
  };

  useEffect(() => {
    loadAll();
    const off = onRefresh(() => loadAll());
    return off;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // auto-select when lists update
  useEffect(() => {
    setForm((p) => ({ ...p, patientId: p.patientId || (patients[0]?._id || "") }));
  }, [patients]);

  useEffect(() => {
    setForm((p) => ({ ...p, doctorId: p.doctorId || (doctors[0]?._id || "") }));
  }, [doctors]);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const addAppointment = async () => {
    if (!form.patientId || !form.doctorId || !form.date || !form.time) {
      alert("⚠️ Choisis patient, doctor, date, time.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/appointments", {
        patientId: form.patientId,
        doctorId: form.doctorId,
        date: form.date,
        time: form.time,
        status: form.status,
        reason: form.reason || "",
      });

      setForm({ patientId: "", doctorId: "", date: "", time: "", status: "PENDING", reason: "" });
      await loadAll();
      emitRefresh(); // ✅ met à jour history/billing/etc
      alert("✅ Rendez-vous ajouté !");
    } catch (e) {
      console.log(e);
      alert("❌ Erreur ajout rendez-vous");
    } finally {
      setLoading(false);
    }
  };

  const deleteAppointment = async (id) => {
    if (!confirm("Supprimer ce rendez-vous ?")) return;
    try {
      await api.delete(`/appointments/${id}`);
      await loadAll();
      emitRefresh();
    } catch (e) {
      console.log(e);
      alert("❌ Erreur suppression");
    }
  };

  const labelStatus = useMemo(() => ({
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    DONE: "Done",
    CANCELLED: "Cancelled",
  }), []);

  return (
    <div style={styles.page}>
      <h1 style={styles.h1}>Gestion des rendez-vous</h1>

      <div style={styles.card}>
        <h3 style={{ marginTop: 0 }}>Planifier un nouveau rendez-vous</h3>

        <div style={styles.grid}>
          <label style={styles.field}>
            <span style={styles.label}>Patient</span>
            <select name="patientId" value={form.patientId} onChange={onChange} style={styles.input}>
              <option value="">Sélectionner un patient</option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>{p.firstName} {p.lastName}</option>
              ))}
            </select>
          </label>

          <label style={styles.field}>
            <span style={styles.label}>Docteur</span>
            <select name="doctorId" value={form.doctorId} onChange={onChange} style={styles.input}>
              <option value="">Évaluer un docteur</option>
              {doctors.map((d) => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </label>

          <label style={styles.field}>
            <span style={styles.label}>Date</span>
            <input type="date" name="date" value={form.date} onChange={onChange} style={styles.input} />
          </label>

          <label style={styles.field}>
            <span style={styles.label}>Heure</span>
            <input type="time" name="time" value={form.time} onChange={onChange} style={styles.input} />
          </label>

          <label style={styles.field}>
            <span style={styles.label}>Status</span>
            <select name="status" value={form.status} onChange={onChange} style={styles.input}>
              {Object.keys(labelStatus).map((k) => (
                <option key={k} value={k}>{labelStatus[k]}</option>
              ))}
            </select>
          </label>

          <label style={styles.field}>
            <span style={styles.label}>Reason</span>
            <input name="reason" value={form.reason} onChange={onChange} style={styles.input} placeholder="Consultation..." />
          </label>
        </div>

        <button style={styles.btnPrimary} onClick={addAppointment} disabled={loading}>
          ➕ Ajouter rendez-vous
        </button>
      </div>

      <div style={styles.card}>
        <h3 style={{ marginTop: 0 }}>Rendez-vous ({appointments.length})</h3>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Patient</th>
              <th style={styles.th}>Doctor</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Time</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th} />
            </tr>
          </thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a._id}>
                <td style={styles.td}>{a.patientName || "-"}</td>
                <td style={styles.td}>{a.doctorName || "-"}</td>
                <td style={styles.td}>{a.date || "-"}</td>
                <td style={styles.td}>{a.time || "-"}</td>
                <td style={styles.td}>{a.status || "-"}</td>
                <td style={styles.td}>
                  <button style={styles.iconBtnDanger} onClick={() => deleteAppointment(a._id)}>🗑️</button>
                </td>
              </tr>
            ))}
            {appointments.length === 0 ? (
              <tr><td colSpan={6} style={styles.empty}>Aucun rendez-vous.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: 10, display: "flex", flexDirection: "column", gap: 12 },
  h1: { margin: 0, fontSize: 28 },
  card: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 14, boxShadow: "0 2px 10px rgba(0,0,0,0.04)", overflowX: "auto" },

  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 12 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: 900, color: "#334155" },
  input: { padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb", outline: "none" },

  btnPrimary: { padding: "10px 12px", borderRadius: 10, border: "none", background: "#0ea5e9", color: "#fff", fontWeight: 900, cursor: "pointer", width: 220 },

  table: { width: "100%", borderCollapse: "collapse", minWidth: 900 },
  th: { textAlign: "left", borderBottom: "1px solid #e5e7eb", padding: "10px 8px", fontSize: 12, color: "#334155", fontWeight: 900 },
  td: { borderBottom: "1px solid #f1f5f9", padding: "10px 8px", fontSize: 13, color: "#0f172a", fontWeight: 700 },
  empty: { padding: 14, color: "#64748b", fontWeight: 800 },

  iconBtnDanger: { border: "1px solid #fecaca", background: "#fee2e2", padding: "6px 10px", borderRadius: 10, cursor: "pointer", fontWeight: 900 },
};