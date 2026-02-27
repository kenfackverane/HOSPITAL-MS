const express = require("express");
const router = express.Router();

const { getPatientHistory } = require("../controllers/HistoryController");

// ✅ GET (pas POST)
router.get("/:id/history", getPatientHistory);

module.exports = router;