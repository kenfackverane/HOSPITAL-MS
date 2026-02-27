const mongoose = require("mongoose");
const Invoice = require("../models/Invoice");
const Patient = require("../models/Patient");

// GET /invoices
exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /invoices
exports.createInvoice = async (req, res) => {
  try {
    const {
      patientId,
      patientName, // optionnel (on le reconstruit depuis Patient)
      services,

      currency,
      amountOriginal,
      exchangeRate,

      vatRate, // ex: 0.1925
      status,

      invoiceDate,

      paymentMethod,
      paymentRef,
      paymentDate,
    } = req.body;

    // ✅ Required fields
    if (!patientId || amountOriginal === undefined || !invoiceDate) {
      return res.status(400).json({
        error: "patientId, amountOriginal and invoiceDate are required",
      });
    }

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ error: "Invalid patientId" });
    }

    // ✅ Ensure patient exists (and build patientName)
    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    const finalPatientName =
      (patientName && String(patientName).trim()) ||
      `${patient.firstName} ${patient.lastName}`;

    // ✅ Currency + rate
    const cur = ["FCFA", "EUR", "USD"].includes(currency) ? currency : "FCFA";

    let rate = 1;
    if (cur !== "FCFA") rate = Number(exchangeRate || 1);

    if (!rate || Number.isNaN(rate) || rate <= 0) {
      return res.status(400).json({ error: "exchangeRate must be > 0" });
    }

    // ✅ amountOriginal
    const original = Number(amountOriginal);
    if (Number.isNaN(original) || original <= 0) {
      return res.status(400).json({ error: "amountOriginal must be > 0" });
    }

    // ✅ Compute amountFCFA
    const amountFCFA = cur === "FCFA" ? original : original * rate;

    // ✅ VAT
    const vr = vatRate === undefined || vatRate === null ? 0 : Number(vatRate);
    if (Number.isNaN(vr) || vr < 0) {
      return res.status(400).json({ error: "vatRate must be >= 0" });
    }

    const vatAmountFCFA = amountFCFA * vr;
    const totalFCFA = amountFCFA + vatAmountFCFA;

    // ✅ Status
    const st = status === "PAID" ? "PAID" : "UNPAID";

    // ✅ Payment
    const pm = ["CASH", "MOMO", "CARD"].includes(paymentMethod)
      ? paymentMethod
      : "CASH";

    const created = await Invoice.create({
      patientId,
      patientName: finalPatientName,

      services: services || "",

      currency: cur,
      amountOriginal: Math.round(original * 100) / 100,
      exchangeRate: Math.round(rate * 1000000) / 1000000,

      amountFCFA: Math.round(amountFCFA * 100) / 100,
      vatRate: Math.round(vr * 1000000) / 1000000,
      vatAmountFCFA: Math.round(vatAmountFCFA * 100) / 100,
      totalFCFA: Math.round(totalFCFA * 100) / 100,

      status: st,
      invoiceDate,

      paymentMethod: pm,
      paymentRef: paymentRef || "",
      paymentDate: paymentDate || "",
    });

    res.status(201).json({ message: "Invoice created ✅", invoice: created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /invoices/:id
exports.updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid invoice id" });
    }

    // On permet de modifier: services, status, vatRate, payment..., date, etc.
    // Et on recalcule totalFCFA si vatRate / amountOriginal / currency / exchangeRate changent.
    const invoice = await Invoice.findById(id);
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });

    const {
      services,
      status,
      invoiceDate,

      currency,
      amountOriginal,
      exchangeRate,
      vatRate,

      paymentMethod,
      paymentRef,
      paymentDate,
    } = req.body;

    // Update simple fields
    if (services !== undefined) invoice.services = services;
    if (invoiceDate !== undefined) invoice.invoiceDate = invoiceDate;

    if (status !== undefined) invoice.status = status === "PAID" ? "PAID" : "UNPAID";

    if (paymentMethod !== undefined) {
      invoice.paymentMethod = ["CASH", "MOMO", "CARD"].includes(paymentMethod)
        ? paymentMethod
        : invoice.paymentMethod;
    }
    if (paymentRef !== undefined) invoice.paymentRef = paymentRef;
    if (paymentDate !== undefined) invoice.paymentDate = paymentDate;

    // Currency + amount changes (optional)
    let mustRecalc = false;

    if (currency !== undefined) {
      invoice.currency = ["FCFA", "EUR", "USD"].includes(currency)
        ? currency
        : invoice.currency;
      mustRecalc = true;
    }

    if (amountOriginal !== undefined) {
      const original = Number(amountOriginal);
      if (Number.isNaN(original) || original <= 0) {
        return res.status(400).json({ error: "amountOriginal must be > 0" });
      }
      invoice.amountOriginal = Math.round(original * 100) / 100;
      mustRecalc = true;
    }

    if (exchangeRate !== undefined) {
      const r = Number(exchangeRate);
      if (Number.isNaN(r) || r <= 0) {
        return res.status(400).json({ error: "exchangeRate must be > 0" });
      }
      invoice.exchangeRate = Math.round(r * 1000000) / 1000000;
      mustRecalc = true;
    }

    if (vatRate !== undefined) {
      const vr = Number(vatRate);
      if (Number.isNaN(vr) || vr < 0) {
        return res.status(400).json({ error: "vatRate must be >= 0" });
      }
      invoice.vatRate = Math.round(vr * 1000000) / 1000000;
      mustRecalc = true;
    }

    // Recalculate derived fields
    if (mustRecalc) {
      const cur = invoice.currency || "FCFA";
      const rate = cur === "FCFA" ? 1 : Number(invoice.exchangeRate || 1);

      if (!rate || Number.isNaN(rate) || rate <= 0) {
        return res.status(400).json({ error: "exchangeRate must be > 0" });
      }

      const original = Number(invoice.amountOriginal);
      if (Number.isNaN(original) || original <= 0) {
        return res.status(400).json({ error: "amountOriginal must be > 0" });
      }

      const amountFCFA = cur === "FCFA" ? original : original * rate;
      const vr = Number(invoice.vatRate || 0);
      const vatAmountFCFA = amountFCFA * vr;
      const totalFCFA = amountFCFA + vatAmountFCFA;

      invoice.amountFCFA = Math.round(amountFCFA * 100) / 100;
      invoice.vatAmountFCFA = Math.round(vatAmountFCFA * 100) / 100;
      invoice.totalFCFA = Math.round(totalFCFA * 100) / 100;
    }

    const saved = await invoice.save();
    res.json({ message: "Invoice updated ✅", invoice: saved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /invoices/:id
exports.deleteInvoice = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid invoice id" });
    }

    const deleted = await Invoice.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Invoice not found" });

    res.json({ message: "Invoice deleted ✅" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /invoices/stats
exports.getBillingStats = async (req, res) => {
  try {
    const paidAgg = await Invoice.aggregate([
      { $match: { status: "PAID" } },
      { $group: { _id: null, sum: { $sum: "$totalFCFA" } } }, // ✅ total en FCFA
    ]);

    const unpaidAgg = await Invoice.aggregate([
      { $match: { status: "UNPAID" } },
      { $group: { _id: null, sum: { $sum: "$totalFCFA" } } },
    ]);

    res.json({
      paidFCFA: paidAgg[0]?.sum || 0,
      unpaidFCFA: unpaidAgg[0]?.sum || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};