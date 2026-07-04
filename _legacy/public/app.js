// ---- State ----
const selection = { frontend: null, backend: null, database: null, cloud: null };
let catalog = null;
let axes = [];

// ---- Boot ----
init();

async function init() {
  catalog = await fetch("/api/catalog").then((r) => r.json());
  axes = catalog.axes;
  renderPicker();
  renderTiers();
  document.getElementById("tier").addEventListener("change", refresh);
  document.getElementById("reset").addEventListener("click", reset);
  refresh();
}

function renderPicker() {
  const root = document.getElementById("picker");
  root.innerHTML = "";
  for (const cat of catalog.categories) {
    const col = document.createElement("div");
    col.className = "category";
    col.innerHTML = `<h3>${cat.label}</h3>`;
    for (const opt of cat.options) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "option";
      btn.dataset.cat = cat.key;
      btn.dataset.id = opt.id;
      btn.innerHTML = `<div class="opt-name">${opt.name}</div><div class="opt-role">${opt.role}</div>`;
      btn.addEventListener("click", () => toggle(cat.key, opt.id));
      col.appendChild(btn);
    }
    root.appendChild(col);
  }
}

function renderTiers() {
  const sel = document.getElementById("tier");
  sel.innerHTML = "";
  for (const t of catalog.tiers) {
    const o = document.createElement("option");
    o.value = t.key;
    o.textContent = `${t.label} — ${t.note}`;
    sel.appendChild(o);
  }
  sel.value = "growth";
}

function toggle(cat, id) {
  selection[cat] = selection[cat] === id ? null : id;
  // reflect selection in the buttons
  document.querySelectorAll(`.option[data-cat="${cat}"]`).forEach((b) => {
    b.classList.toggle("selected", b.dataset.id === selection[cat]);
  });
  refresh();
}

function reset() {
  for (const k of Object.keys(selection)) selection[k] = null;
  document.querySelectorAll(".option.selected").forEach((b) => b.classList.remove("selected"));
  refresh();
}

async function refresh() {
  const tier = document.getElementById("tier").value;
  const anyPicked = Object.values(selection).some(Boolean);

  document.getElementById("results").hidden = !anyPicked;
  document.getElementById("empty").hidden = anyPicked;
  if (!anyPicked) return;

  const data = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ selection, tier }),
  }).then((r) => r.json());

  renderResults(data);
}

function renderResults(data) {
  document.getElementById("overall").textContent = data.overall;
  document.getElementById("counts").textContent =
    `${data.counts.synergies} synergies · ${data.counts.frictions} cautions`;

  document.getElementById("cost").textContent =
    `$${data.cost.low}–$${data.cost.high}`;
  document.getElementById("cost-detail").textContent = data.cost.lines.length
    ? data.cost.lines.map((l) => `${l.label} ~$${l.amount}`).join(" · ")
    : "Pick a backend, database, and cloud for a cost estimate.";

  // notes
  const notesEl = document.getElementById("notes");
  notesEl.innerHTML = "";
  for (const n of data.notes) {
    const div = document.createElement("div");
    div.className = `note ${n.type}`;
    div.innerHTML = `<div class="note-title"><span class="badge">${n.type}</span>${n.title}</div><div class="note-detail">${n.detail}</div>`;
    notesEl.appendChild(div);
  }

  // stack detail cards
  const detail = document.getElementById("stack-detail");
  detail.innerHTML = "";
  for (const t of data.chosen) {
    const card = document.createElement("div");
    card.className = "tech-card";
    card.innerHTML = `
      <div class="tc-head">
        <span class="tc-cat">${t.category}</span>
        <h4>${t.name}</h4>
        <span class="tc-role">${t.role}</span>
      </div>
      <p class="tc-blurb">${t.blurb}</p>
      <div class="tc-cols">
        <div><h5>Strengths</h5><ul class="good">${t.strengths.map((s) => `<li>${s}</li>`).join("")}</ul></div>
        <div><h5>Watch out for</h5><ul class="bad">${t.weaknesses.map((s) => `<li>${s}</li>`).join("")}</ul></div>
      </div>`;
    detail.appendChild(card);
  }

  drawRadar(data.axisScores);
}

// ---- Radar chart (vanilla canvas, no libraries) ----
function drawRadar(axisScores) {
  const canvas = document.getElementById("radar");
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2 + 6;
  const radius = Math.min(W, H) / 2 - 46;
  const n = axes.length;
  const maxVal = 5;

  ctx.clearRect(0, 0, W, H);

  // grid rings
  ctx.strokeStyle = "#2a2f3a";
  ctx.fillStyle = "#99a0ac";
  ctx.font = "11px system-ui, sans-serif";
  for (let ring = 1; ring <= maxVal; ring++) {
    const r = (radius * ring) / maxVal;
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const a = angle(i, n);
      const x = cx + r * Math.cos(a);
      const y = cy + r * Math.sin(a);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // spokes + labels
  for (let i = 0; i < n; i++) {
    const a = angle(i, n);
    const x = cx + radius * Math.cos(a);
    const y = cy + radius * Math.sin(a);
    ctx.strokeStyle = "#2a2f3a";
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x, y);
    ctx.stroke();

    const lx = cx + (radius + 18) * Math.cos(a);
    const ly = cy + (radius + 18) * Math.sin(a);
    ctx.fillStyle = "#99a0ac";
    ctx.textAlign = Math.abs(Math.cos(a)) < 0.3 ? "center" : Math.cos(a) > 0 ? "left" : "right";
    ctx.textBaseline = "middle";
    ctx.fillText(shortLabel(axes[i].label), lx, ly);
  }

  // data polygon
  ctx.beginPath();
  for (let i = 0; i <= n; i++) {
    const idx = i % n;
    const val = axisScores[axes[idx].key] ?? 0;
    const r = (radius * val) / maxVal;
    const a = angle(idx, n);
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = "rgba(91,141,239,0.25)";
  ctx.strokeStyle = "#5b8def";
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();

  // data points
  ctx.fillStyle = "#5b8def";
  for (let i = 0; i < n; i++) {
    const val = axisScores[axes[i].key] ?? 0;
    const r = (radius * val) / maxVal;
    const a = angle(i, n);
    ctx.beginPath();
    ctx.arc(cx + r * Math.cos(a), cy + r * Math.sin(a), 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function angle(i, n) {
  // start at top (-90deg) and go clockwise
  return (Math.PI * 2 * i) / n - Math.PI / 2;
}

function shortLabel(label) {
  return label.replace("Ease of learning", "Ease").replace("Cost efficiency", "Cost").replace("Hiring pool", "Hiring").replace("Dev speed", "Speed");
}
