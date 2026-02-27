const express = require("express");
const app = express();

app.get("/", (req, res) => res.send("OK"));

app.listen(4000, () => console.log("Server running on 4000 ✅"));