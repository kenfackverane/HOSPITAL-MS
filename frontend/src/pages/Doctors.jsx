import { useEffect, useMemo, useState } from "react";
import api from "../api/http";
import { emitRefresh, onRefresh } from "../utils/bus";

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [q, setQ] = useState("");

  const [form, setForm] = useState({
    name: "",
    specialisation: "",
    telephone: "",
    disponibilite: "",
  });

  const [editingId, setEditingId] = useState(null);

  const loadDoctors = async () => {
    try {
      const res = await api.get("/doctors");
      setDoctors(res.data || []);
    } catch (e) {
      console.log(e);
      alert("❌ Impossible de charger les doctors");
    }
  };

  useEffect(() => {
    loadDoctors();
    const off = onRefresh(() => loadDoctors());
    return off;
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return doctors;
    return doctors.filter((d) =>
      `${d.name} ${d.specialisation} ${d.telephone} ${d.disponibilite}`.toLowerCase().includes(s)
    );
  }, [doctors, q]);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const resetForm = () => {
    setForm({ name: "", specialisation: "", telephone: "", disponibilite: "" });
    setEditingId(null);
  };

  const saveDoctor = async () => {
    if (!form.name.trim() || !form.specialisation.trim()) {
      alert("⚠️ name et specialisation obligatoires");
      return;
    }
    try {
      if (editingId) {
        await api.put(`/doctors/${editingId}`, form);
      } else {
        await api.post("/doctors", form);
      }
      resetForm();
      await loadDoctors();
      emitRefresh();
    } catch (e) {
      console.log(e);
      alert("❌ Erreur sauvegarde doctor");
    }
  };

  const editDoctor = (d) => {
    setEditingId(d._id);
    setForm({
      name: d.name || "",
      specialisation: d.specialisation || "",
      telephone: d.telephone || "",
      disponibilite: d.disponibilite || "",
    });
  };

  const deleteDoctor = async (id) => {
    if (!confirm("Supprimer ce doctor ?")) return;
    try {
      await api.delete(`/doctors/${id}`);
      await loadDoctors();
      emitRefresh();
    } catch (e) {
      console.log(e);
      alert("❌ Erreur suppression doctor");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.head}>
        <div>
          <h1 style={styles.h1}>Doctors</h1>
          <p style={styles.sub}>Créer / Modifier / Supprimer — mise à jour automatique</p>
        </div>
        <input
          placeholder="Rechercher…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={styles.search}
        />
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3 style={{ marginTop: 0 }}>{editingId ? "✏️ Modifier doctor" : "➕ Nouveau doctor"}</h3>

          <div style={styles.formGrid}>
            <Field label="Name" name="name" value={form.name} onChange={onChange} />
            <Field label="Specialisation" name="specialisation" value={form.specialisation} onChange={onChange} />
            <Field label="Telephone" name="telephone" value={form.telephone} onChange={onChange} />
            <Field label="Disponibilite" name="disponibilite" value={form.disponibilite} onChange={onChange} />
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
            <button style={styles.btnPrimary} onClick={saveDoctor}>
              {editingId ? "Update" : "Create"}
            </button>
            {editingId ? (
              <button style={styles.btn} onClick={resetForm}>Cancel</button>
            ) : null}
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={{ marginTop: 0 }}>Liste des doctors ({filtered.length})</h3>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Nom</th>
                <th style={styles.th}>Spécialité</th>
                <th style={styles.th}>Téléphone</th>
                <th style={styles.th}>Disponibilité</th>
                <th style={styles.th} />
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d._id}>
                  <td style={styles.td}>{d.name}</td>
                  <td style={styles.td}>{d.specialisation}</td>
                  <td style={styles.td}>{d.telephone || "-"}</td>
                  <td style={styles.td}>{d.disponibilite || "-"}</td>
                  <td style={styles.td}>
                    <button style={styles.iconBtn} onClick={() => editDoctor(d)}>✏️</button>
                    <button style={styles.iconBtnDanger} onClick={() => deleteDoctor(d._id)}>🗑️</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr><td colSpan={5} style={styles.empty}>Aucun doctor.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange }) {
  return (
    <label style={styles.field}>
      <span style={styles.label}>{label}</span>
      <input name={name} value={value} onChange={onChange} style={styles.input} />
    </label>
  );
}

const styles = {
  page: { padding: 10, display: "flex", flexDirection: "column", gap: 12 },
  head: { display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-end" },
  h1: { margin: 0, fontSize: 28 },
  sub: { margin: "6px 0 0", color: "#6b7280", fontSize: 13 },
  search: { padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb", minWidth: 260 },

  grid: { display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 12 },
  card: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 14, boxShadow: "0 2px 10px rgba(0,0,0,0.04)", overflowX: "auto" },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: 10 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: 800, color: "#334155" },
  input: { padding: 10, borderRadius: 10, border: "1px solid #e5e7eb", outline: "none" },

  btnPrimary: { padding: "10px 12px", borderRadius: 10, border: "none", background: "#111827", color: "#fff", fontWeight: 900, cursor: "pointer" },
  btn: { padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", fontWeight: 900, cursor: "pointer" },

  table: { width: "100%", borderCollapse: "collapse", minWidth: 820 },
  th: { textAlign: "left", borderBottom: "1px solid #e5e7eb", padding: "10px 8px", fontSize: 12, color: "#334155", fontWeight: 900 },
  td: { borderBottom: "1px solid #f1f5f9", padding: "10px 8px", fontSize: 13, color: "#0f172a", fontWeight: 700 },
  empty: { padding: 14, color: "#64748b", fontWeight: 800 },

  iconBtn: { border: "1px solid #e5e7eb", background: "#fff", padding: "6px 10px", borderRadius: 10, cursor: "pointer", marginRight: 8, fontWeight: 900 },
  iconBtnDanger: { border: "1px solid #fecaca", background: "#fee2e2", padding: "6px 10px", borderRadius: 10, cursor: "pointer", fontWeight: 900 },
};