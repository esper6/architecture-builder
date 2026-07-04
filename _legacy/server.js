const path = require("path");
const express = require("express");

const { technologies, AXES, TIERS } = require("./data/technologies");
const { analyze } = require("./data/analyze");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Metadata the frontend needs to build the picker (techs grouped by category, axes, tiers).
app.get("/api/catalog", (req, res) => {
  const categories = [
    { key: "frontend", label: "Frontend" },
    { key: "backend", label: "Backend" },
    { key: "database", label: "Database" },
    { key: "cloud", label: "Cloud" },
  ].map((cat) => ({
    ...cat,
    options: technologies.filter((t) => t.category === cat.key),
  }));
  res.json({ categories, axes: AXES, tiers: TIERS });
});

// Analyze a selection. Body: { selection: {frontend,backend,database,cloud}, tier }
app.post("/api/analyze", (req, res) => {
  const { selection = {}, tier = "growth" } = req.body || {};
  const clean = {
    frontend: selection.frontend || null,
    backend: selection.backend || null,
    database: selection.database || null,
    cloud: selection.cloud || null,
  };
  res.json(analyze(clean, tier));
});

app.listen(PORT, () => {
  console.log(`Architecture Builder running at http://localhost:${PORT}`);
});
