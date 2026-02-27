import { useEffect, useState } from "react";
import api from "../api/http";
import { onRefresh } from "../utils/bus";

export default function History() {
  const [patients, setPatients] = useState([]);
  const [patientId, setPatientId] = useState("");
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);

  const loadPatients = async () => {
    try {
      const res = await api.get("/patients");
      const list = res.data || [];
      setPatients(list);

      if (!patientId && list.length > 0) {
        setPatientId(list[0]._id);
      }
    } catch (e) {
      console.log(e);
      setPatients([]);
    }
  };

  const loadHistory = async (id) => {
    try {
      const res = await api.get(`/patients/${id}/history`);
      setPatient(res.data?.patient || null);
      setAppointments(Array.isArray(res.data?.appointments) ? res.data.appointments : []);
    } catch (e) {
      console.log(e);
      setPatient(null);
      setAppointments([]);
    }
  };

  useEffect(() => {
    loadPatients();
    const off = onRefresh(() => loadPatients());
    return off;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (patientId) loadHistory(patientId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ marginTop: 0 }}>Patient History</h1>

      <select
        value={patientId}
        onChange={(e) => setPatientId(e.target.value)}
        style={styles.select}
      >
        {patients.length === 0 ? (
          <option value="">Aucun patient</option>
        ) : (
          patients.map((p) => (
            <option key={p._id} value={p._id}>
              {p.firstName} {p.lastName}
            </option>
          ))
        )}
      </select>

      {patient && (
        <div style={styles.card}>
          <h3 style={{ marginTop: 0 }}>Patient Information</h3>
          <p><b>Name:</b> {patient.firstName} {patient.lastName}</p>
          <p><b>Phone:</b> {patient.phone || "-"}</p>
          <p><b>Age:</b> {patient.age ?? "-"}</p>
          <p><b>Gender:</b> {patient.gender || "-"}</p>
          <p><b>Address:</b> {patient.address || "-"}</p>
        </div>
      )}

      <div style={styles.card}>
        <div style={styles.cardTitle}>📅 Rendez-vous (avec maladie / motif)</div>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Heure</th>
              <th style={styles.th}>Médecin</th>
              <th style={styles.th}>Maladie / Motif</th>
              <th style={styles.th}>Statut</th>
            </tr>
          </thead>

          <tbody>
            {appointments.map((a) => (
              <tr key={a._id}>
                <td style={styles.td}>{a.date || "-"}</td>
                <td style={styles.td}>{a.time || "-"}</td>
                <td style={styles.td}>{a.doctorName || "-"}</td>
                <td style={styles.td}>{a.reason || "-"}</td>
                <td style={styles.td}>{a.status || "-"}</td>
              </tr>
            ))}

            {appointments.length === 0 && (
              <tr>
                <td colSpan={5} style={styles.empty}>Aucun rendez-vous.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  select: {
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    marginTop: "10px",
    minWidth: 260,
  },

  card: {
    background: "#ffffff",
    padding: "18px",
    borderRadius: "12px",
    marginTop: "20px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    overflowX: "auto",
  },

  cardTitle: {
    fontWeight: 900,
    marginBottom: 12,
    color: "#0f172a",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 760,
  },

  th: {
    textAlign: "left",
    borderBottom: "1px solid #e5e7eb",
    padding: "10px 8px",
    fontSize: 12,
    color: "#334155",
    fontWeight: 900,
  },

  td: {
    borderBottom: "1px solid #f1f5f9",
    padding: "10px 8px",
    fontSize: 13,
    color: "#0f172a",
    fontWeight: 700,
  },

  empty: {
    padding: 14,
    color: "#64748b",
    fontWeight: 800,
  },
};