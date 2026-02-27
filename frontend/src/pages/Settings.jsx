import React, { useEffect, useMemo, useRef, useState } from "react";
import { logout as logoutLocal } from "../utils/auth"; // ✅ AJOUT

export default function Settings() {
  // ✅ Default settings
  const defaultSettings = useMemo(
    () => ({
      clinic: {
        name: "My Clinic",
        phone: "+237 6xx xx xx xx",
        address: "Douala, Cameroon",
        currency: "FCFA",
      },
      billing: {
        vatPercent: 0,
        invoicePrefix: "INV-",
        defaultPaymentMode: "CASH", // CASH | MOMO | CARD | INSURANCE
      },
      system: {
        autoLockMinutes: 0, // 0 = disabled
      },
    }),
    []
  );

  const fileRef = useRef(null);

  // ✅ Load from localStorage
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("hms_settings");
      return saved ? JSON.parse(saved) : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  const [savedMsg, setSavedMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // ✅ Autosave on change
  useEffect(() => {
    try {
      localStorage.setItem("hms_settings", JSON.stringify(settings));
      setSavedMsg("Saved ✅");
      const t = setTimeout(() => setSavedMsg(""), 1200);
      return () => clearTimeout(t);
    } catch (e) {
      setErrorMsg("Impossible de sauvegarder (storage).");
    }
  }, [settings]);

  const updateClinic = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      clinic: { ...prev.clinic, [key]: value },
    }));
  };

  const updateBilling = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      billing: { ...prev.billing, [key]: value },
    }));
  };

  const updateSystem = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      system: { ...prev.system, [key]: value },
    }));
  };

  // ✅ Export JSON (backup)
  const exportBackup = () => {
    setErrorMsg("");
    try {
      const payload = {
        exportedAt: new Date().toISOString(),
        app: "offline-hospital-ms",
        settings,
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hms-backup-settings-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setErrorMsg("Erreur lors de l'export.");
    }
  };

  // ✅ Import JSON (restore)
  const onPickFile = () => {
    setErrorMsg("");
    fileRef.current?.click();
  };

  const importBackup = async (file) => {
    setErrorMsg("");
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Accept either direct settings or wrapper object
      const incoming = data?.settings ? data.settings : data;

      if (!incoming?.clinic || !incoming?.billing || !incoming?.system) {
        throw new Error("Invalid file structure");
      }

      setSettings(incoming);
    } catch (e) {
      setErrorMsg("Fichier invalide. (JSON settings attendu)");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const resetSettings = () => {
    setErrorMsg("");
    setSettings(defaultSettings);
  };

  // ✅ LOGOUT (fonctionne à coup sûr)
  const handleLogout = () => {
    const ok = confirm("Se déconnecter ?");
    if (!ok) return;

    // 1) supprime le token (ProtectedRoute te bloque)
    logoutLocal();

    // 2) optionnel : tu peux aussi enlever des infos de session si tu en as
    // localStorage.removeItem("user");

    // 3) redirection vers login
    window.location.href = "/login";
  };

  // ✅ Optionnel : reset total (settings + token + caches)
  const clearAllLocalData = () => {
    const ok = confirm("Tout effacer ? (settings + session/login)");
    if (!ok) return;

    localStorage.removeItem("hms_settings");
    logoutLocal(); // remove token too
    window.location.href = "/login";
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Settings</h1>
          <p style={styles.subtitle}>
            Paramètres de l’application (offline) — sauvegarde automatique
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          {savedMsg ? <span style={styles.savedBadge}>{savedMsg}</span> : null}

          <button onClick={exportBackup} style={styles.btnPrimary}>
            Export Backup
          </button>
          <button onClick={onPickFile} style={styles.btn}>
            Import Backup
          </button>

          {/* ✅ LOGOUT BUTTON */}
          <button onClick={handleLogout} style={styles.btnLogout}>
            Logout
          </button>

          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            style={{ display: "none" }}
            onChange={(e) => importBackup(e.target.files?.[0])}
          />
        </div>
      </div>

      {errorMsg ? <div style={styles.error}>{errorMsg}</div> : null}

      {/* Clinic Info */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>🏥 Clinic Info</h2>
        <div style={styles.grid2}>
          <Field
            label="Clinic name"
            value={settings.clinic.name}
            onChange={(v) => updateClinic("name", v)}
          />
          <Field
            label="Phone"
            value={settings.clinic.phone}
            onChange={(v) => updateClinic("phone", v)}
          />
          <Field
            label="Address"
            value={settings.clinic.address}
            onChange={(v) => updateClinic("address", v)}
          />
          <SelectField
            label="Currency"
            value={settings.clinic.currency}
            onChange={(v) => updateClinic("currency", v)}
            options={["FCFA", "EUR", "USD", "GBP"]}
          />
        </div>
        <p style={styles.help}>
          Ces infos peuvent être affichées sur les factures et reçus.
        </p>
      </div>

      {/* Billing Settings */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>🧾 Billing</h2>
        <div style={styles.grid2}>
          <NumberField
            label="VAT (%)"
            value={settings.billing.vatPercent}
            onChange={(v) => updateBilling("vatPercent", v)}
            min={0}
            max={100}
          />
          <Field
            label="Invoice prefix"
            value={settings.billing.invoicePrefix}
            onChange={(v) => updateBilling("invoicePrefix", v)}
            placeholder="INV-"
          />
          <SelectField
            label="Default payment mode"
            value={settings.billing.defaultPaymentMode}
            onChange={(v) => updateBilling("defaultPaymentMode", v)}
            options={[
              { label: "Cash", value: "CASH" },
              { label: "Mobile Money", value: "MOMO" },
              { label: "Card", value: "CARD" },
              { label: "Insurance", value: "INSURANCE" },
            ]}
          />
          <div style={styles.previewBox}>
            <div style={styles.previewTitle}>Example Invoice No.</div>
            <div style={styles.previewValue}>
              {settings.billing.invoicePrefix}000124
            </div>
            <div style={styles.previewHint}>
              TVA: {settings.billing.vatPercent}%
            </div>
          </div>
        </div>
      </div>

      {/* System / Security */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>🔒 System</h2>
        <div style={styles.grid2}>
          <SelectField
            label="Auto-lock (minutes)"
            value={String(settings.system.autoLockMinutes)}
            onChange={(v) => updateSystem("autoLockMinutes", Number(v))}
            options={[
              { label: "Disabled", value: "0" },
              { label: "5 minutes", value: "5" },
              { label: "10 minutes", value: "10" },
              { label: "15 minutes", value: "15" },
              { label: "30 minutes", value: "30" },
            ]}
          />
          <div style={styles.infoBox}>
            <div style={{ fontWeight: 700 }}>Offline note</div>
            <div style={{ color: "#6b7280", fontSize: 13, marginTop: 6 }}>
              Les paramètres sont stockés en local (localStorage). Ajoute un vrai
              système d’utilisateurs plus tard si besoin.
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div style={styles.cardDanger}>
        <h2 style={styles.cardTitle}>⚠️ Danger Zone</h2>
        <p style={styles.help}>
          Réinitialise uniquement les paramètres (pas la base patients).
        </p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={resetSettings} style={styles.btnDanger}>
            Reset Settings
          </button>

          {/* ✅ Optionnel */}
          <button onClick={clearAllLocalData} style={styles.btnDangerOutline}>
            Clear all local data
          </button>
        </div>
      </div>
    </div>
  );
}

/* --- Small reusable inputs --- */

function Field({ label, value, onChange, placeholder }) {
  return (
    <label style={styles.field}>
      <span style={styles.label}>{label}</span>
      <input
        style={styles.input}
        value={value}
        placeholder={placeholder || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function NumberField({ label, value, onChange, min, max }) {
  return (
    <label style={styles.field}>
      <span style={styles.label}>{label}</span>
      <input
        type="number"
        style={styles.input}
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  const normalized = Array.isArray(options)
    ? options.map((o) => (typeof o === "string" ? { label: o, value: o } : o))
    : [];

  return (
    <label style={styles.field}>
      <span style={styles.label}>{label}</span>
      <select style={styles.input} value={value} onChange={(e) => onChange(e.target.value)}>
        {normalized.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/* --- Styles (classic, simple) --- */
const styles = {
  page: { padding: 20, display: "flex", flexDirection: "column", gap: 14 },
  header: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  title: { margin: 0, fontSize: 26 },
  subtitle: { margin: "6px 0 0", color: "#6b7280", fontSize: 14 },

  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
  },
  cardDanger: {
    background: "#fff",
    border: "1px solid #fecaca",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
  },
  cardTitle: { margin: "0 0 12px", fontSize: 16 },

  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 12,
  },

  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, color: "#374151", fontWeight: 600 },
  input: {
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: "10px 12px",
    outline: "none",
    fontSize: 14,
  },

  help: { color: "#6b7280", fontSize: 13, margin: "10px 0 0" },

  btn: {
    border: "1px solid #e5e7eb",
    background: "#fff",
    padding: "10px 12px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
  },
  btnPrimary: {
    border: "1px solid #2563eb",
    background: "#2563eb",
    color: "#fff",
    padding: "10px 12px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
  },

  // ✅ logout
  btnLogout: {
    border: "1px solid #dc2626",
    background: "#dc2626",
    color: "#fff",
    padding: "10px 12px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 800,
  },

  btnDanger: {
    border: "1px solid #dc2626",
    background: "#dc2626",
    color: "#fff",
    padding: "10px 12px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 800,
  },
  btnDangerOutline: {
    border: "1px solid #dc2626",
    background: "#fff",
    color: "#dc2626",
    padding: "10px 12px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 800,
  },

  savedBadge: {
    border: "1px solid #bbf7d0",
    background: "#dcfce7",
    color: "#166534",
    padding: "8px 10px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 800,
  },

  error: {
    border: "1px solid #fecaca",
    background: "#fee2e2",
    color: "#991b1b",
    padding: 12,
    borderRadius: 12,
    fontWeight: 700,
  },

  previewBox: {
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 12,
    background: "#f9fafb",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  previewTitle: { color: "#6b7280", fontSize: 12, fontWeight: 800 },
  previewValue: { fontSize: 18, fontWeight: 900, color: "#111827" },
  previewHint: { color: "#6b7280", fontSize: 13 },

  infoBox: {
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 12,
    background: "#f9fafb",
  },
};