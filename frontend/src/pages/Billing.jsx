import { useEffect, useMemo, useRef, useState } from "react";
import api from "../api/http";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function Billing() {
  const invoiceRef = useRef(null);

  const [patients, setPatients] = useState([]);
  const [invoices, setInvoices] = useState([]);

  // Filters (advanced)
  const [filters, setFilters] = useState({
    q: "",
    status: "",
    currency: "",
    from: "",
    to: "",
  });

  // Form invoice
  const [form, setForm] = useState({
    patientId: "",
    services: "",
    currency: "FCFA",
    amountOriginal: "",
    exchangeRate: 600, // for USD/EUR -> FCFA
    vatRate: 0.1925,
    status: "UNPAID",
    invoiceDate: "",
    paymentMethod: "CASH",
    paymentRef: "",
    paymentDate: "",
  });

  // Selected invoice to print (only)
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    loadPatients();
    loadInvoices();
  }, []);

  const loadPatients = async () => {
    const res = await api.get("/patients");
    setPatients(res.data);
  };

  const loadInvoices = async () => {
    const params = {};
    if (filters.q) params.q = filters.q;
    if (filters.status) params.status = filters.status;
    if (filters.currency) params.currency = filters.currency;
    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;

    const res = await api.get("/invoices", { params });
    setInvoices(res.data);
  };

  const patientName = useMemo(() => {
    const p = patients.find((x) => x._id === form.patientId);
    return p ? `${p.firstName} ${p.lastName}` : "";
  }, [patients, form.patientId]);

  const compute = useMemo(() => {
    const amountOriginal = Number(form.amountOriginal || 0);
    const vatRate = Number(form.vatRate || 0);
    const rate = Number(form.exchangeRate || 1);

    const amountFCFA = form.currency === "FCFA" ? amountOriginal : amountOriginal * rate;
    const vatFCFA = amountFCFA * vatRate;
    const totalFCFA = amountFCFA + vatFCFA;

    return { amountFCFA, vatFCFA, totalFCFA };
  }, [form.amountOriginal, form.vatRate, form.exchangeRate, form.currency]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addInvoice = async () => {
    if (!form.patientId || !form.services || !form.amountOriginal || !form.invoiceDate) {
      alert("⚠️ Fill: Patient, Services, Amount, Date.");
      return;
    }

    await api.post("/invoices", {
      patientId: form.patientId,
      services: form.services,
      currency: form.currency,
      amountOriginal: Number(form.amountOriginal),
      exchangeRate: Number(form.exchangeRate || 1),
      vatRate: Number(form.vatRate || 0),
      status: form.status,
      invoiceDate: form.invoiceDate,
      paymentMethod: form.paymentMethod,
      paymentRef: form.paymentRef,
      paymentDate: form.paymentDate,
    });

    alert("✅ Invoice created");
    setForm({
      patientId: "",
      services: "",
      currency: "FCFA",
      amountOriginal: "",
      exchangeRate: 600,
      vatRate: 0.1925,
      status: "UNPAID",
      invoiceDate: "",
      paymentMethod: "CASH",
      paymentRef: "",
      paymentDate: "",
    });
    await loadInvoices();
  };

  const removeInvoice = async (id) => {
    if (!confirm("Delete this invoice?")) return;
    await api.delete(`/invoices/${id}`);
    await loadInvoices();
    if (selected?._id === id) setSelected(null);
  };

  const openInvoice = (inv) => setSelected(inv);

  const printOnlyInvoice = () => window.print();

  const exportPDF = async () => {
    const el = invoiceRef.current;
    if (!el) return;

    const canvas = await html2canvas(el, { scale: 2 });
    const img = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const w = 210;
    const h = (canvas.height * w) / canvas.width;
    pdf.addImage(img, "PNG", 0, 0, w, h);
    pdf.save("invoice.pdf");
  };

  // IMPORTANT: When selected != null, show ONLY invoice (true invoice print page)
  if (selected) {
    return (
      <div style={printWrap}>
        <style>
          {`
          @media print {
            body * { visibility: hidden; }
            #invoiceArea, #invoiceArea * { visibility: visible; }
            #invoiceArea { position: absolute; left: 0; top: 0; width: 100%; }
            .noPrint { display: none !important; }
          }
        `}
        </style>

        <div className="noPrint" style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <button style={btn} onClick={() => setSelected(null)}>⬅ Back</button>
          <button style={btnPrimary} onClick={printOnlyInvoice}>🖨 Print</button>
          <button style={btn} onClick={exportPDF}>⬇ Export PDF</button>
        </div>

        <div id="invoiceArea" ref={invoiceRef} style={invoiceCard}>
          <InvoiceView invoice={selected} />
        </div>
      </div>
    );
  }

  // Normal billing page
  return (
    <div>
      <h1 style={{ marginBottom: 14 }}>Billing</h1>

      <div style={twoCols}>
        {/* Create invoice */}
        <div style={panel}>
          <h3 style={{ marginTop: 0 }}>Create Invoice</h3>

          <Field label="Patient">
            <select name="patientId" value={form.patientId} onChange={change} style={input}>
              <option value="">Select patient</option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.firstName} {p.lastName}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Services">
            <textarea
              name="services"
              value={form.services}
              onChange={change}
              style={{ ...input, minHeight: 70 }}
              placeholder="Consultation, Radiology..."
            />
          </Field>

          <div style={grid2}>
            <Field label="Currency">
              <select name="currency" value={form.currency} onChange={change} style={input}>
                <option value="FCFA">FCFA</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </Field>

            <Field label="Amount (original)">
              <input
                name="amountOriginal"
                type="number"
                value={form.amountOriginal}
                onChange={change}
                style={input}
                placeholder="0"
              />
            </Field>
          </div>

          {form.currency !== "FCFA" && (
            <Field label={`Exchange rate (${form.currency} → FCFA)`}>
              <input
                name="exchangeRate"
                type="number"
                value={form.exchangeRate}
                onChange={change}
                style={input}
              />
            </Field>
          )}

          <div style={grid2}>
            <Field label="VAT rate (TVA)">
              <input name="vatRate" type="number" step="0.0001" value={form.vatRate} onChange={change} style={input} />
            </Field>
            <Field label="Invoice Date">
              <input name="invoiceDate" type="date" value={form.invoiceDate} onChange={change} style={input} />
            </Field>
          </div>

          <div style={grid2}>
            <Field label="Status">
              <select name="status" value={form.status} onChange={change} style={input}>
                <option value="UNPAID">UNPAID</option>
                <option value="PAID">PAID</option>
              </select>
            </Field>
            <Field label="Payment Method">
              <select name="paymentMethod" value={form.paymentMethod} onChange={change} style={input}>
                <option value="CASH">CASH</option>
                <option value="MOMO">MOMO</option>
                <option value="CARD">CARD</option>
              </select>
            </Field>
          </div>

          <div style={grid2}>
            <Field label="Payment Ref (optional)">
              <input name="paymentRef" value={form.paymentRef} onChange={change} style={input} placeholder="Tx ref..." />
            </Field>
            <Field label="Payment Date (optional)">
              <input name="paymentDate" type="date" value={form.paymentDate} onChange={change} style={input} />
            </Field>
          </div>

          {/* totals preview */}
          <div style={totalsBox}>
            <div style={totalsRow}>
              <span>Patient</span>
              <b>{patientName || "-"}</b>
            </div>
            <div style={totalsRow}>
              <span>Subtotal (FCFA)</span>
              <b>{formatMoney(compute.amountFCFA)} FCFA</b>
            </div>
            <div style={totalsRow}>
              <span>VAT (FCFA)</span>
              <b>{formatMoney(compute.vatFCFA)} FCFA</b>
            </div>
            <div style={{ ...totalsRow, borderTop: "1px dashed #cbd5e1", paddingTop: 10 }}>
              <span>Total (FCFA)</span>
              <b>{formatMoney(compute.totalFCFA)} FCFA</b>
            </div>
          </div>

          <button onClick={addInvoice} style={btnPrimaryWide}>
            Create Invoice
          </button>
        </div>

        {/* List invoices + filters */}
        <div style={panel}>
          <h3 style={{ marginTop: 0 }}>Invoices</h3>

          <div style={filtersRow}>
            <input
              placeholder="Search (patient/services)..."
              value={filters.q}
              onChange={(e) => setFilters({ ...filters, q: e.target.value })}
              style={input}
            />
            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} style={input}>
              <option value="">All status</option>
              <option value="PAID">PAID</option>
              <option value="UNPAID">UNPAID</option>
            </select>
            <select value={filters.currency} onChange={(e) => setFilters({ ...filters, currency: e.target.value })} style={input}>
              <option value="">All currency</option>
              <option value="FCFA">FCFA</option>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
            </select>
            <input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} style={input} />
            <input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} style={input} />
            <button style={btn} onClick={loadInvoices}>Apply</button>
          </div>

          <table style={table}>
            <thead>
              <tr>
                <th style={th}>ID</th>
                <th style={th}>Patient</th>
                <th style={th}>Total (FCFA)</th>
                <th style={th}>Status</th>
                <th style={{ ...th, width: 210 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv._id}>
                  <td style={td}>#{String(inv._id).slice(-6)}</td>
                  <td style={td}>{inv.patientName}</td>
                  <td style={td}>{formatMoney(inv.totalFCFA)} FCFA</td>
                  <td style={td}>
                    <span style={inv.status === "PAID" ? badgePaid : badgeUnpaid}>{inv.status}</span>
                  </td>
                  <td style={td}>
                    <button style={miniBtn} onClick={() => openInvoice(inv)}>🧾 Open</button>{" "}
                    <button style={miniBtnDanger} onClick={() => removeInvoice(inv._id)}>🗑 Delete</button>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td style={td} colSpan={5}>No invoices.</td>
                </tr>
              )}
            </tbody>
          </table>

          <p style={{ color: "#64748b", marginTop: 10 }}>
            Tip: click <b>Open</b> to show only the printable invoice.
          </p>
        </div>
      </div>
    </div>
  );
}

function InvoiceView({ invoice }) {
  return (
    <div style={{ padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0 }}>INVOICE</h2>
          <div style={{ color: "#64748b", marginTop: 6 }}>
            Invoice #: <b>{String(invoice._id).slice(-6)}</b>
          </div>
          <div style={{ color: "#64748b" }}>
            Date: <b>{invoice.invoiceDate}</b>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 800 }}>Offline Hospital</div>
          <div style={{ color: "#64748b" }}>Douala, Cameroon</div>
          <div style={{ color: "#64748b" }}>Tel: +237 XXX XXX XXX</div>
        </div>
      </div>

      <hr style={{ margin: "14px 0", borderColor: "#e2e8f0" }} />

      <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Billed To</div>
          <div style={{ fontWeight: 800 }}>{invoice.patientName}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, color: "#64748b" }}>Payment</div>
          <div><b>{invoice.paymentMethod}</b></div>
          {invoice.paymentRef ? <div style={{ color: "#64748b" }}>Ref: {invoice.paymentRef}</div> : null}
          {invoice.paymentDate ? <div style={{ color: "#64748b" }}>Paid on: {invoice.paymentDate}</div> : null}
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Services</div>
        <div style={servicesBox}>{invoice.services || "-"}</div>
      </div>

      <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
        <div style={totLine}>
          <span>Subtotal (FCFA)</span>
          <b>{formatMoney(invoice.amountFCFA)} FCFA</b>
        </div>
        <div style={totLine}>
          <span>VAT (FCFA)</span>
          <b>{formatMoney(invoice.vatAmountFCFA)} FCFA</b>
        </div>
        <div style={{ ...totLine, borderTop: "1px dashed #cbd5e1", paddingTop: 10 }}>
          <span>Total (FCFA)</span>
          <b style={{ fontSize: 18 }}>{formatMoney(invoice.totalFCFA)} FCFA</b>
        </div>

        <div style={{ color: "#64748b", fontSize: 12 }}>
          Currency input: <b>{invoice.currency}</b> — Amount: <b>{invoice.amountOriginal}</b> ({invoice.currency})
        </div>

        <div style={{ marginTop: 14, color: "#64748b", fontSize: 12, textAlign: "center" }}>
          Thank you for your visit.
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

function formatMoney(n) {
  const x = Number(n || 0);
  return x.toLocaleString("fr-FR");
}

const twoCols = {
  display: "grid",
  gridTemplateColumns: "1fr 1.2fr",
  gap: 14,
};

const panel = {
  background: "white",
  borderRadius: 12,
  padding: 14,
  boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
};

const input = {
  width: "100%",
  padding: 10,
  borderRadius: 10,
  border: "1px solid #e2e8f0",
  outline: "none",
};

const grid2 = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
};

const totalsBox = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  padding: 12,
  borderRadius: 12,
  marginTop: 10,
  marginBottom: 10,
};

const totalsRow = {
  display: "flex",
  justifyContent: "space-between",
  padding: "6px 0",
};

const btnPrimaryWide = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 10,
  border: "none",
  cursor: "pointer",
  background: "#111827",
  color: "white",
  fontWeight: 800,
};

const btnPrimary = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "none",
  cursor: "pointer",
  background: "#111827",
  color: "white",
  fontWeight: 800,
};

const btn = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #e2e8f0",
  cursor: "pointer",
  background: "white",
};

const filtersRow = {
  display: "grid",
  gridTemplateColumns: "1.2fr 0.8fr 0.8fr 0.8fr 0.8fr auto",
  gap: 10,
  marginBottom: 12,
};

const table = { width: "100%", borderCollapse: "collapse" };
const th = { textAlign: "left", padding: 10, borderBottom: "1px solid #e2e8f0", color: "#334155" };
const td = { padding: 10, borderBottom: "1px solid #f1f5f9", color: "#0f172a" };

const miniBtn = {
  padding: "7px 10px",
  borderRadius: 10,
  border: "1px solid #e2e8f0",
  background: "white",
  cursor: "pointer",
};
const miniBtnDanger = {
  ...miniBtn,
  border: "1px solid #fecaca",
  background: "#fff1f2",
};

const badgePaid = {
  padding: "4px 10px",
  borderRadius: 999,
  background: "#dcfce7",
  color: "#166534",
  fontWeight: 800,
  fontSize: 12,
};
const badgeUnpaid = {
  padding: "4px 10px",
  borderRadius: 999,
  background: "#fee2e2",
  color: "#991b1b",
  fontWeight: 800,
  fontSize: 12,
};

const printWrap = {
  background: "#f1f5f9",
  minHeight: "100vh",
  padding: 16,
};

const invoiceCard = {
  maxWidth: 820,
  margin: "0 auto",
  background: "white",
  borderRadius: 14,
  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  overflow: "hidden",
};

const servicesBox = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  padding: 12,
  whiteSpace: "pre-wrap",
};

const totLine = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};