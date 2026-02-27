const router = require("express").Router();
const c = require("../controllers/InvoiceController");

router.get("/", c.getInvoices);
router.post("/", c.createInvoice);
router.delete("/:id", c.deleteInvoice);

// optionnel
router.get("/stats", c.getBillingStats);

module.exports = router;