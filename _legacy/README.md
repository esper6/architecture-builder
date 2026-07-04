# 🏗️ Architecture Builder

Pick one technology per layer (frontend, backend, database, cloud) and see the
tradeoffs you'd be making — cost, performance, scalability, ease of learning,
ecosystem, hiring pool, and dev speed — plus the **synergies and frictions**
between specific combinations.

It's both a toy and a learning tool: the knowledge base explains *what each tech
is* and *why pieces fit (or don't) together*.

## How the pieces fit together (the thing you're learning)

A typical web app has four layers. This app maps your listed technologies onto them:

| Layer        | What it does                                  | Options here                          |
| ------------ | --------------------------------------------- | ------------------------------------- |
| **Frontend** | Runs in the browser, draws the UI             | React, Angular, **Next.js**           |
| **Backend**  | Runs on a server, holds business logic & APIs | Node.js, .NET Core                    |
| **Database** | Stores the data                               | PostgreSQL, MongoDB, MSSQL            |
| **Cloud**    | The machines that host all of the above       | AWS, Azure                            |

A few key ideas the app encodes:

- **React is a library, not a framework** — you assemble routing/state/build yourself.
- **Next.js blurs frontend & backend** — it can run server code, so it can *be* your
  backend for many apps (which is why pairing it with a separate Node backend is
  often redundant).
- **The Microsoft stack is cohesive**: .NET Core + MSSQL + Azure are designed to
  work together, and MSSQL is cheapest on Azure (it costs a licensing premium on AWS).
- **All-JavaScript stacks** (React/Next + Node + Mongo/Postgres) mean one language
  end to end — fast iteration, big hiring pool.

## Run it locally

```bash
npm install
npm start
# then open http://localhost:3000
```

Use `npm run dev` to auto-restart on file changes (Node's built-in `--watch`).

If port 3000 is busy (Docker/WSL often grab it), pick another:

```bash
# PowerShell
$env:PORT = "3100"; npm start
# bash
PORT=3100 npm start
```

## Project layout

```
server.js              Express server + two JSON endpoints
data/
  technologies.js      The knowledge base (scores, strengths, costs)
  rules.js             Combination logic: synergies, frictions, cost model
  analyze.js           Ties data + rules into one analysis result
public/
  index.html           The page
  style.css            Styling
  app.js               UI logic + a hand-drawn radar chart (no chart library)
```

**Where to extend it:** add a technology by appending to `data/technologies.js`;
add a "these two work well/badly together" rule in `data/rules.js`. The UI updates
automatically from the catalog — no frontend changes needed.

## API

- `GET /api/catalog` → categories with their options, the score axes, and traffic tiers.
- `POST /api/analyze` → body `{ "selection": { frontend, backend, database, cloud }, "tier": "hobby|growth|scale" }`,
  returns averaged axis scores, synergy/friction notes, an overall 0–100 score, and a cost estimate.

## Deploying to your Azure Ubuntu box (later)

This is a plain Node app, so deployment is straightforward:

1. Install Node 18+ on the Ubuntu VM (`nvm` or the NodeSource apt repo).
2. Copy the project up (`git clone` or `scp`), then `npm install --omit=dev`.
3. Run it under a process manager so it restarts on crash/reboot:
   ```bash
   sudo npm install -g pm2
   PORT=8080 pm2 start server.js --name architecture-builder
   pm2 save && pm2 startup
   ```
4. Put **nginx** in front as a reverse proxy (handles TLS and port 80/443 → 8080),
   and open the port in the Azure **Network Security Group**.
5. For HTTPS, use Let's Encrypt (`certbot`) on the nginx host.

> The scores and cost figures are heuristic teaching numbers (higher = better on
> every axis), not vendor quotes. Tune them in `data/` to match your own experience.
```
