import { useEffect, useMemo, useState } from "react";
import api from "../api/http";
import { emitRefresh, onRefresh } from "../utils/bus";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [q, setQ] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    age: "",
    gender: "OTHER", // MALE | FEMALE | OTHER
  });

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadPatients = async () => {
    try {
      const res = await api.get("/patients");
      setPatients(res.data || []);
    } catch (e) {
      console.log(e);
      alert("❌ Impossible de charger les patients");
    }
  };

  useEffect(() => {
    loadPatients();
    const off = onRefresh(() => loadPatients());
    return off;
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return patients;
    return patients.filter((p) =>
      `${p.firstName} ${p.lastName} ${p.phone} ${p.address} ${p.age ?? ""} ${p.gender ?? ""}`
        .toLowerCase()
        .includes(s)
    );
  }, [patients, q]);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const resetForm = () => {
    setForm({
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      age: "",
      gender: "OTHER",
    });
    setEditingId(null);
  };

  const savePatient = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      alert("⚠️ firstName et lastName obligatoires");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone || "",
        address: form.address || "",
        age: form.age === "" ? null : Number(form.age),
        gender: form.gender || "OTHER",
      };

      if (editingId) {
        await api.put(`/patients/${editingId}`, payload);
      } else {
        await api.post("/patients", payload);
      }

      resetForm();
      await loadPatients();
      emitRefresh(); // ✅ met à jour partout (appointments, history, billing)
    } catch (e) {
      console.log(e);
      alert("❌ Erreur sauvegarde patient");
    } finally {
      setLoading(false);
    }
  };

  const editPatient = (p) => {
    setEditingId(p._id);
    setForm({
      firstName: p.firstName || "",
      lastName: p.lastName || "",
      phone: p.phone || "",
      address: p.address || "",
      age: p.age ?? "",
      gender: p.gender || "OTHER",
    });
  };

  const deletePatient = async (id) => {
    if (!confirm("Supprimer ce patient ?")) return;
    try {
      await api.delete(`/patients/${id}`);
      await loadPatients();
      emitRefresh();
    } catch (e) {
      console.log(e);
      alert("❌ Erreur suppression patient");
    }
  };

  const genderLabel = (g) => {
    if (g === "MALE") return "Masculin";
    if (g === "FEMALE") return "Féminin";
    return "Autre";
  };

  return (
    <div style={styles.page}>
      <div style={styles.head}>
        <div>
          <h1 style={styles.h1}>Patients</h1>
          <p style={styles.sub}>Créer / Modifier / Supprimer — mise à jour automatique</p>
        </div>

        <input
          placeholder="Rechercher… (nom, tel, âge, sexe, adresse)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={styles.search}
        />
      </div>

      <div style={styles.grid}>
        {/* FORM */}
        <div style={styles.card}>
          <h3 style={{ marginTop: 0 }}>
            {editingId ? "✏️ Modifier patient" : "➕ Nouveau patient"}
          </h3>

          <div style={styles.formGrid}>
            <Field label="First name" name="firstName" value={form.firstName} onChange={onChange} />
            <Field label="Last name" name="lastName" value={form.lastName} onChange={onChange} />
            <Field label="Phone" name="phone" value={form.phone} onChange={onChange} />
            <Field label="Address" name="address" value={form.address} onChange={onChange} />

            {/* ✅ NEW */}
            <Field
              label="Age"
              name="age"
              type="number"
              value={form.age}
              onChange={onChange}
              placeholder="Ex: 24"
            />

            {/* ✅ NEW */}
            <Select
              label="Gender"
              name="gender"
              value={form.gender}
              onChange={onChange}
              options={[
                { label: "Masculin", value: "MALE" },
                { label: "Féminin", value: "FEMALE" },
                { label: "Autre", value: "OTHER" },
              ]}
            />
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
            <button style={styles.btnPrimary} onClick={savePatient} disabled={loading}>
              {loading ? "Saving..." : editingId ? "Update" : "Create"}
            </button>

            <button style={styles.btn} onClick={resetForm} disabled={loading}>
              {editingId ? "Cancel" : "Reset"}
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div style={styles.card}>
          <h3 style={{ marginTop: 0 }}>Liste des patients ({filtered.length})</h3>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Nom</th>
                <th style={styles.th}>Téléphone</th>
                <th style={styles.th}>Âge</th>
                <th style={styles.th}>Sexe</th>
                <th style={styles.th}>Adresse</th>
                <th style={styles.th} />
              </tr>
            </thead>

            <tbody>
              {filtered.map((p) => (
                <tr key={p._id}>
                  <td style={styles.td}>
                    {p.firstName} {p.lastName}
                  </td>
                  <td style={styles.td}>{p.phone || "-"}</td>
                  <td style={styles.td}>{p.age ?? "-"}</td>
                  <td style={styles.td}>{genderLabel(p.gender)}</td>
                  <td style={styles.td}>{p.address || "-"}</td>
                  <td style={styles.td}>
                    <button style={styles.iconBtn} onClick={() => editPatient(p)} title="Edit">
                      ✏️
                    </button>
                    <button
                      style={styles.iconBtnDanger}
                      onClick={() => deletePatient(p._id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={styles.empty}>
                    Aucun patient.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange, type = "text", placeholder = "" }) {
  return (
    <label style={styles.field}>
      <span style={styles.label}>{label}</span>
      <input
        name={name}
        value={value}
        onChange={onChange}
        style={styles.input}
        type={type}
        placeholder={placeholder}
      />
    </label>
  );
}

function Select({ label, name, value, onChange, options }) {
  return (
    <label style={styles.field}>
      <span style={styles.label}>{label}</span>
      <select name={name} value={value} onChange={onChange} style={styles.input}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

const styles = {
  page: { padding: 10, display: "flex", flexDirection: "column", gap: 12 },
  head: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "flex-end",
  },
  h1: { margin: 0, fontSize: 28 },
  sub: { margin: "6px 0 0", color: "#6b7280", fontSize: 13 },
  search: { padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb", minWidth: 320 },

  grid: { display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 12 },
  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 14,
    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
    overflowX: "auto",
  },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: 10 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: 800, color: "#334155" },
  input: { padding: 10, borderRadius: 10, border: "1px solid #e5e7eb", outline: "none" },

  btnPrimary: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "none",
    background: "#111827",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
  },
  btn: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "#fff",
    fontWeight: 900,
    cursor: "pointer",
  },

  table: { width: "100%", borderCollapse: "collapse", minWidth: 860 },
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
    verticalAlign: "top",
  },
  empty: { padding: 14, color: "#64748b", fontWeight: 800 },

  iconBtn: {
    border: "1px solid #e5e7eb",
    background: "#fff",
    padding: "6px 10px",
    borderRadius: 10,
    cursor: "pointer",
    marginRight: 8,
    fontWeight: 900,
  },
  iconBtnDanger: {
    border: "1px solid #fecaca",
    background: "#fee2e2",
    padding: "6px 10px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 900,
  },
};