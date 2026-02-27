const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    patientName: { type: String, required: true },

    services: { type: String, default: "" },

    // 💱 Multi-currency
    currency: { type: String, enum: ["FCFA", "EUR", "USD"], default: "FCFA" },
    amountOriginal: { type: Number, required: true }, // montant saisi
    exchangeRate: { type: Number, default: 1 },       // vers FCFA
    amountFCFA: { type: Number, required: true },     // base interne

    // 🧾 VAT / TVA
    vatRate: { type: Number, default: 0 },            // ex: 0.1925
    vatAmountFCFA: { type: Number, default: 0 },
    totalFCFA: { type: Number, required: true },

    status: { type: String, enum: ["PAID", "UNPAID"], default: "UNPAID" },
    invoiceDate: { type: String, required: true }, // YYYY-MM-DD

    // 💳 Multi-payment
    paymentMethod: { type: String, enum: ["CASH", "MOMO", "CARD"], default: "CASH" },
    paymentRef: { type: String, default: "" },
    paymentDate: { type: String, default: "" }, // YYYY-MM-DD
  },
  { timestamps: true }
);

module.exports = mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);