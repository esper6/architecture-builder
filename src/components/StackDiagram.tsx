import type { Stack } from "../lib/scoring";
import type { Tech, TechId } from "../data/types";
import { getTech } from "../data";

/**
 * The system blueprint: draws the SHAPE your choices make. The topology
 * comes from the architecture-style slot — a monolith is one process box,
 * microservices are several, event-driven puts the broker in the middle,
 * CQRS+ES splits the write and read paths. Everything else decorates that
 * topology. Hand-rolled SVG per ADR-003; deliberately not editable (v1).
 *
 * Visual language: solid edges = synchronous request/response;
 * dashed = async/events; red arcs = combinations that fight.
 */

interface DNode {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sub?: string;
  shape: "box" | "cylinder" | "pill" | "ghost";
  title?: string;
}

interface DEdge {
  from: string;
  to: string;
  label?: string;
  async?: boolean;
}

interface DBox {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
}

interface Layout {
  w: number;
  h: number;
  nodes: DNode[];
  edges: DEdge[];
  boxes: DBox[];
}

const NODE_W = 148;
const NODE_H = 46;

function techNode(
  id: TechId,
  x: number,
  y: number,
  sub?: string,
  w = NODE_W,
  h = NODE_H,
): DNode {
  const t = getTech(id);
  return { id, x, y, w, h, label: t.name, sub, shape: "box", title: t.tagline };
}

function cylinder(id: TechId, x: number, y: number, sub?: string): DNode {
  const t = getTech(id);
  return { id, x, y, w: 120, h: 58, label: t.name, sub, shape: "cylinder", title: t.tagline };
}

/** Client + optional CDN + optional frontend chain. Returns last node id. */
function buildFront(
  stack: Stack,
  nodes: DNode[],
  edges: DEdge[],
  cy: number,
  apiLabel: string | undefined,
): { lastId: string; nextX: number } {
  nodes.push({
    id: "client",
    x: 16,
    y: cy,
    w: 84,
    h: NODE_H,
    label: "Client",
    sub: "browser / partner",
    shape: "pill",
  });
  let lastId = "client";
  let x = 128;
  if (stack.caching === "cdn-cache") {
    nodes.push(techNode("cdn-cache", x, cy, "edge cache", 108));
    edges.push({ from: lastId, to: "cdn-cache" });
    lastId = "cdn-cache";
    x += 136;
  }
  if (stack.frontend) {
    nodes.push(techNode(stack.frontend, x, cy, "frontend", 128));
    edges.push({ from: lastId, to: stack.frontend });
    lastId = stack.frontend;
    x += 156;
  }
  // API-style label rides the edge into the app; drawn by caller via edge label
  void apiLabel;
  return { lastId, nextX: x };
}

function authPill(stack: Stack, nodes: DNode[], x: number, y: number) {
  if (!stack.auth) return;
  const t = getTech(stack.auth);
  nodes.push({
    id: stack.auth,
    x,
    y,
    w: 128,
    h: 30,
    label: `🔐 ${t.name}`,
    shape: "pill",
    title: t.tagline,
  });
}

function cacheNode(stack: Stack, nodes: DNode[], edges: DEdge[], fromId: string, x: number, y: number) {
  if (stack.caching && stack.caching !== "cdn-cache" && stack.caching !== "in-process-cache") {
    nodes.push(techNode(stack.caching, x, y, "cache", 124));
    edges.push({ from: fromId, to: stack.caching });
  }
}

function messagingNodes(
  stack: Stack,
  nodes: DNode[],
  edges: DEdge[],
  fromId: string,
  x: number,
  y: number,
) {
  if (!stack.messaging) return;
  nodes.push(techNode(stack.messaging, x, y, "broker / log", 136));
  nodes.push({
    id: "consumers",
    x: x + 168,
    y,
    w: 118,
    h: NODE_H,
    label: "Consumers",
    sub: "workers · integrations",
    shape: "ghost",
  });
  edges.push({ from: fromId, to: stack.messaging, async: true });
  edges.push({ from: stack.messaging, to: "consumers", async: true });
}

function inProcSub(stack: Stack): string {
  return stack.caching === "in-process-cache" ? " · in-proc cache" : "";
}

function dataAccessLabel(stack: Stack): string | undefined {
  return stack["data-access"] ? getTech(stack["data-access"]).name : undefined;
}

function apiStyleLabel(stack: Stack): string | undefined {
  // Short form — "REST / HTTP+JSON" won't fit on a short edge.
  return stack["api-style"]
    ? getTech(stack["api-style"]).name.split(" /")[0]
    : undefined;
}

/* ---------- Topologies ---------- */

function layoutMonolith(stack: Stack, modular: boolean): Layout {
  const nodes: DNode[] = [];
  const edges: DEdge[] = [];
  const boxes: DBox[] = [];
  const cy = 96;
  const { lastId, nextX } = buildFront(stack, nodes, edges, cy, apiStyleLabel(stack));

  const px = Math.max(nextX + 30, 300);
  const pw = 232;
  const ph = modular ? 150 : 96;
  boxes.push({
    x: px - 12,
    y: cy - 26,
    w: pw + 24,
    h: ph + 40,
    label: modular ? "one deployable · enforced modules" : "one deployable",
  });
  const backendId = stack.backend ?? "backend-missing";
  if (stack.backend) {
    nodes.push(
      techNode(stack.backend, px, cy, `backend${inProcSub(stack)}`, pw, 52),
    );
  } else {
    nodes.push({
      id: backendId,
      x: px,
      y: cy,
      w: pw,
      h: 52,
      label: "— choose a backend —",
      shape: "ghost",
    });
  }
  if (modular) {
    ["Orders", "Billing", "Partners"].forEach((m, i) => {
      nodes.push({
        id: `mod-${i}`,
        x: px + 4 + i * 78,
        y: cy + 64,
        w: 70,
        h: 40,
        label: m,
        sub: "module",
        shape: "ghost",
      });
    });
  }
  edges.push({ from: lastId, to: backendId, label: apiStyleLabel(stack) });
  authPill(stack, nodes, px - 150, cy + 62);

  const dbX = px + pw + 84;
  if (stack.database) {
    nodes.push(cylinder(stack.database, dbX, cy - 4));
    edges.push({ from: backendId, to: stack.database, label: dataAccessLabel(stack) });
  }
  cacheNode(stack, nodes, edges, backendId, dbX, cy + 84);
  messagingNodes(stack, nodes, edges, backendId, px + 30, cy + ph + 48);

  const h = stack.messaging ? cy + ph + 130 : Math.max(cy + ph + 60, 240);
  return { w: dbX + 160, h, nodes, edges, boxes };
}

function layoutMicroservices(stack: Stack): Layout {
  const nodes: DNode[] = [];
  const edges: DEdge[] = [];
  const boxes: DBox[] = [];
  const cy = 130;
  const { lastId, nextX } = buildFront(stack, nodes, edges, cy, apiStyleLabel(stack));

  const gwX = Math.max(nextX + 24, 300);
  nodes.push({
    id: "gateway",
    x: gwX,
    y: cy,
    w: 104,
    h: NODE_H,
    label: "Gateway",
    sub: "routing · authN",
    shape: "pill",
  });
  edges.push({ from: lastId, to: "gateway", label: apiStyleLabel(stack) });
  authPill(stack, nodes, gwX - 12, cy + 62);

  const svcX = gwX + 160;
  const backendName = stack.backend ? getTech(stack.backend).name : "service";
  const dbName = stack.database ? getTech(stack.database).name : undefined;
  const svcYs = [24, 112, 200];
  ["Orders", "Billing", "Partners"].forEach((domain, i) => {
    const sid = `svc-${i}`;
    nodes.push({
      id: sid,
      x: svcX,
      y: svcYs[i],
      w: 158,
      h: 50,
      label: `${domain} service`,
      sub: `${backendName}${inProcSub(stack)}`,
      shape: "box",
      title: "Each service: own deploy, own data",
    });
    edges.push({ from: "gateway", to: sid });
    if (dbName) {
      nodes.push({
        id: `db-${i}`,
        x: svcX + 210,
        y: svcYs[i] - 3,
        w: 104,
        h: 54,
        label: dbName,
        sub: "own data",
        shape: "cylinder",
      });
      edges.push({ from: sid, to: `db-${i}`, label: i === 1 ? dataAccessLabel(stack) : undefined });
    }
  });
  boxes.push({
    x: svcX - 16,
    y: 8,
    w: 348,
    h: 262,
    label: "independently deployed services",
  });
  messagingNodes(stack, nodes, edges, "svc-1", svcX - 8, 292);
  cacheNode(stack, nodes, edges, "svc-0", gwX + 4, 24);

  return {
    w: svcX + 356,
    h: stack.messaging ? 372 : 292,
    nodes,
    edges,
    boxes,
  };
}

function layoutEventDriven(stack: Stack): Layout {
  const nodes: DNode[] = [];
  const edges: DEdge[] = [];
  const boxes: DBox[] = [];
  const cy = 104;
  const { lastId, nextX } = buildFront(stack, nodes, edges, cy, apiStyleLabel(stack));

  const px = Math.max(nextX + 24, 300);
  const backendId = stack.backend ?? "producer";
  nodes.push(
    stack.backend
      ? techNode(stack.backend, px, cy, "producer service", 168, 50)
      : { id: backendId, x: px, y: cy, w: 168, h: 50, label: "Producer service", shape: "ghost" },
  );
  edges.push({ from: lastId, to: backendId, label: apiStyleLabel(stack) });
  authPill(stack, nodes, px - 148, cy + 64);

  const brokerX = px + 40;
  const brokerY = cy + 118;
  const brokerId = stack.messaging ?? "broker";
  nodes.push(
    stack.messaging
      ? techNode(stack.messaging, brokerX, brokerY, "the backbone — events are facts", 170, 54)
      : {
          id: brokerId,
          x: brokerX,
          y: brokerY,
          w: 170,
          h: 54,
          label: "— choose messaging —",
          sub: "this style needs a broker",
          shape: "ghost",
        },
  );
  edges.push({ from: backendId, to: brokerId, async: true, label: "publishes facts" });

  const consX = brokerX + 250;
  [
    ["Fulfillment", "consumer"],
    ["Analytics", "consumer"],
    ["EDI outbound", "consumer"],
  ].forEach(([name, sub], i) => {
    const cid = `cons-${i}`;
    nodes.push({
      id: cid,
      x: consX,
      y: brokerY - 78 + i * 72,
      w: 132,
      h: 44,
      label: name,
      sub,
      shape: "ghost",
    });
    edges.push({ from: brokerId, to: cid, async: true });
  });

  if (stack.database) {
    nodes.push(cylinder(stack.database, px + 250, cy - 8, "producer's data"));
    edges.push({ from: backendId, to: stack.database, label: dataAccessLabel(stack) });
  }
  cacheNode(stack, nodes, edges, backendId, px + 16, 12);

  return { w: consX + 176, h: brokerY + 130, nodes, edges, boxes };
}

function layoutServerless(stack: Stack): Layout {
  const nodes: DNode[] = [];
  const edges: DEdge[] = [];
  const boxes: DBox[] = [];
  const cy = 104;
  const { lastId, nextX } = buildFront(stack, nodes, edges, cy, apiStyleLabel(stack));

  const gwX = Math.max(nextX + 24, 292);
  nodes.push({
    id: "gateway",
    x: gwX,
    y: cy,
    w: 110,
    h: NODE_H,
    label: "API Gateway",
    sub: "managed",
    shape: "pill",
  });
  edges.push({ from: lastId, to: "gateway", label: apiStyleLabel(stack) });
  authPill(stack, nodes, gwX - 8, cy + 60);

  const fnX = gwX + 156;
  const backendName = stack.backend ? getTech(stack.backend).name : "handler";
  [0, 1, 2].forEach((i) => {
    nodes.push({
      id: `fn-${i}`,
      x: fnX,
      y: 24 + i * 76,
      w: 128,
      h: 46,
      label: `λ ${["orders", "billing", "webhooks"][i]}`,
      sub: backendName,
      shape: "box",
      title: "Scales to zero; cold starts; execution limits",
    });
    edges.push({ from: "gateway", to: `fn-${i}` });
  });
  boxes.push({ x: fnX - 14, y: 10, w: 156, h: 252, label: "functions · pay per use" });

  if (stack.database) {
    nodes.push(cylinder(stack.database, fnX + 202, 92));
    edges.push({ from: "fn-1", to: stack.database, label: dataAccessLabel(stack) });
  }
  messagingNodes(stack, nodes, edges, "fn-2", fnX + 12, 288);
  return { w: fnX + 380, h: stack.messaging ? 368 : 288, nodes, edges, boxes };
}

function layoutCqrs(stack: Stack): Layout {
  const nodes: DNode[] = [];
  const edges: DEdge[] = [];
  const boxes: DBox[] = [];
  const cy = 64;
  const { lastId, nextX } = buildFront(stack, nodes, edges, cy, apiStyleLabel(stack));

  const px = Math.max(nextX + 24, 296);
  const backendName = stack.backend ? getTech(stack.backend).name : "…";
  nodes.push({
    id: "commands",
    x: px,
    y: cy - 14,
    w: 160,
    h: 48,
    label: "Command side",
    sub: `${backendName} · writes`,
    shape: "box",
    title: "Validates commands, appends events — never updates in place",
  });
  edges.push({ from: lastId, to: "commands", label: `${apiStyleLabel(stack) ?? ""} commands`.trim() });

  const storeX = px + 216;
  const storeId = stack.database ?? "event-store";
  nodes.push(
    stack.database
      ? cylinder(stack.database, storeX, cy - 18, "as event store · append-only")
      : { id: storeId, x: storeX, y: cy - 18, w: 120, h: 58, label: "Event store", sub: "append-only", shape: "cylinder" },
  );
  edges.push({ from: "commands", to: storeId, label: dataAccessLabel(stack) });

  const projY = cy + 116;
  nodes.push({
    id: "projector",
    x: storeX - 6,
    y: projY,
    w: 132,
    h: 44,
    label: "Projections",
    sub: "replay → rebuild",
    shape: "ghost",
    title: "Consumes the event log and maintains read models — eventually consistent",
  });
  edges.push({ from: storeId, to: "projector", async: true, label: "event stream" });

  nodes.push({
    id: "read-model",
    x: px + 10,
    y: projY,
    w: 150,
    h: 48,
    label: "Read models",
    sub: "shaped per query",
    shape: "cylinder",
  });
  edges.push({ from: "projector", to: "read-model", async: true });
  edges.push({ from: "read-model", to: lastId === "client" ? "client" : lastId, label: "queries" });

  messagingNodes(stack, nodes, edges, storeId, storeX + 190, projY);
  authPill(stack, nodes, px - 150, cy + 46);

  return {
    w: stack.messaging ? storeX + 500 : storeX + 200,
    h: projY + 120,
    nodes,
    edges,
    boxes,
  };
}

function buildLayout(stack: Stack): Layout {
  const layout = (() => {
    switch (stack.architecture) {
      case "modular-monolith":
        return layoutMonolith(stack, true);
      case "microservices":
        return layoutMicroservices(stack);
      case "event-driven":
        return layoutEventDriven(stack);
      case "serverless-arch":
        return layoutServerless(stack);
      case "cqrs-es":
        return layoutCqrs(stack);
      case "monolith":
      default:
        return layoutMonolith(stack, false);
    }
  })();
  // The substrate everything ships to, drawn as a footer pill.
  if (stack.hosting) {
    const t = getTech(stack.hosting);
    layout.nodes.push({
      id: stack.hosting,
      x: 16,
      y: layout.h - 4,
      w: 46 + t.name.length * 7,
      h: 32,
      label: `runs on: ${t.name}`,
      shape: "pill",
      title: t.tagline,
    });
    layout.h += 48;
  }
  return layout;
}

/* ---------- Conflicts (red arcs) ---------- */

interface Conflict {
  a: TechId;
  b: TechId;
  note: string;
  blocker: boolean;
}

function findConflicts(stack: Stack): Conflict[] {
  const techs = Object.values(stack)
    .filter((id): id is TechId => Boolean(id))
    .map(getTech);
  const ids = new Set(techs.map((t) => t.id));
  const backend = techs.find((t) => t.category === "backend");
  const out: Conflict[] = [];
  const seen = new Set<string>();
  const push = (a: Tech, b: Tech, note: string, blocker: boolean) => {
    const key = [a.id, b.id].sort().join("+");
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ a: a.id, b: b.id, note, blocker });
  };
  for (const t of techs) {
    if (
      t.ecosystem &&
      t.category !== "backend" &&
      backend &&
      backend.ecosystem !== t.ecosystem
    ) {
      push(t, backend, `${t.name} can't run on ${backend.name}`, true);
    }
    for (const rel of t.frictionWith ?? []) {
      if (ids.has(rel.techId)) push(t, getTech(rel.techId), rel.note, false);
    }
  }
  return out;
}

/* ---------- Rendering ---------- */

function anchor(from: DNode, to: DNode): [number, number, number, number] {
  const fcx = from.x + from.w / 2;
  const fcy = from.y + from.h / 2;
  const tcx = to.x + to.w / 2;
  const tcy = to.y + to.h / 2;
  const dx = tcx - fcx;
  const dy = tcy - fcy;
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0
      ? [from.x + from.w, fcy, to.x, tcy]
      : [from.x, fcy, to.x + to.w, tcy];
  }
  return dy > 0
    ? [fcx, from.y + from.h, tcx, to.y]
    : [fcx, from.y, tcx, to.y + to.h];
}

function NodeShape({ n }: { n: DNode }) {
  const label = (
    <>
      <text
        x={n.x + n.w / 2}
        y={n.y + n.h / 2 + (n.sub ? -4 : 4)}
        textAnchor="middle"
        fontSize={12}
        fontWeight={600}
        fill={n.shape === "ghost" ? "var(--muted)" : "var(--text-primary)"}
      >
        {n.label}
      </text>
      {n.sub && (
        <text
          x={n.x + n.w / 2}
          y={n.y + n.h / 2 + 12}
          textAnchor="middle"
          fontSize={9.5}
          fill="var(--muted)"
        >
          {n.sub}
        </text>
      )}
    </>
  );
  if (n.shape === "cylinder") {
    const ry = 7;
    return (
      <g>
        {n.title && <title>{n.title}</title>}
        <path
          d={`M ${n.x} ${n.y + ry} A ${n.w / 2} ${ry} 0 0 1 ${n.x + n.w} ${n.y + ry} V ${n.y + n.h - ry} A ${n.w / 2} ${ry} 0 0 1 ${n.x} ${n.y + n.h - ry} Z`}
          fill="var(--surface-2)"
          stroke="var(--baseline)"
        />
        <ellipse
          cx={n.x + n.w / 2}
          cy={n.y + ry}
          rx={n.w / 2}
          ry={ry}
          fill="var(--surface-2)"
          stroke="var(--baseline)"
        />
        {label}
      </g>
    );
  }
  return (
    <g>
      {n.title && <title>{n.title}</title>}
      <rect
        x={n.x}
        y={n.y}
        width={n.w}
        height={n.h}
        rx={n.shape === "pill" ? n.h / 2 : 8}
        fill={n.shape === "ghost" ? "transparent" : "var(--surface-2)"}
        stroke={n.shape === "ghost" ? "var(--grid)" : "var(--baseline)"}
        strokeDasharray={n.shape === "ghost" ? "4 3" : undefined}
      />
      {label}
    </g>
  );
}

export function StackDiagram({ stack }: { stack: Stack }) {
  const layout = buildLayout(stack);
  const byId = new Map(layout.nodes.map((n) => [n.id, n]));
  // Architecture styles have no node of their own — their conflicts anchor
  // to the process/backend node the style shapes.
  const resolve = (id: TechId): DNode | undefined => {
    const direct = byId.get(id);
    if (direct) return direct;
    if (getTech(id).category === "architecture" && stack.backend) {
      return byId.get(stack.backend);
    }
    return undefined;
  };
  const conflicts = findConflicts(stack)
    .map((c) => ({ ...c, na: resolve(c.a), nb: resolve(c.b) }))
    .filter((c) => c.na && c.nb && c.na !== c.nb);

  return (
    <div className="stack-diagram">
      <svg
        viewBox={`0 0 ${layout.w} ${layout.h}`}
        role="img"
        aria-label="System blueprint diagram of the chosen stack"
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 8 8"
            refX="7"
            refY="4"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path
              className="edge-arrow"
              d="M 0 0 L 8 4 L 0 8 z"
              fill="var(--muted)"
            />
          </marker>
        </defs>

        {layout.boxes.map((b, i) => (
          <g key={i}>
            <rect
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              rx={12}
              fill="transparent"
              stroke="var(--grid)"
            />
            <text x={b.x + 10} y={b.y + 16} fontSize={9.5} fill="var(--muted)">
              {b.label}
            </text>
          </g>
        ))}

        {layout.edges.map((e, i) => {
          const from = byId.get(e.from);
          const to = byId.get(e.to);
          if (!from || !to) return null;
          const [x1, y1, x2, y2] = anchor(from, to);
          return (
            <g key={i}>
              <line
                className="edge-line"
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="var(--muted)"
                strokeWidth={2}
                strokeDasharray={e.async ? "5 4" : undefined}
                markerEnd="url(#arrow)"
              />
              {e.label && (
                <text
                  x={(x1 + x2) / 2}
                  y={(y1 + y2) / 2 - 6}
                  textAnchor="middle"
                  fontSize={10}
                  fill="var(--text-secondary)"
                  stroke="var(--surface-1)"
                  strokeWidth={4}
                  paintOrder="stroke"
                >
                  {e.label}
                </text>
              )}
            </g>
          );
        })}

        {conflicts.map((c, i) => {
          const a = c.na!;
          const b = c.nb!;
          const ax = a.x + a.w / 2;
          const ay = a.y + a.h / 2;
          const bx = b.x + b.w / 2;
          const by = b.y + b.h / 2;
          const mx = (ax + bx) / 2;
          const my = (ay + by) / 2 - 46;
          return (
            <g key={`c${i}`}>
              <title>{c.note}</title>
              <path
                className="edge-conflict"
                d={`M ${ax} ${ay} Q ${mx} ${my} ${bx} ${by}`}
                fill="none"
                stroke="var(--critical)"
                strokeWidth={2}
                strokeDasharray={c.blocker ? undefined : "5 4"}
                opacity={0.8}
              />
              <text
                x={mx}
                y={my + 24}
                textAnchor="middle"
                fontSize={12}
                stroke="var(--surface-1)"
                strokeWidth={4}
                paintOrder="stroke"
              >
                {c.blocker ? "⛔" : "⚠️"}
              </text>
            </g>
          );
        })}

        {layout.nodes.map((n) => (
          <NodeShape n={n} key={n.id} />
        ))}
      </svg>
      <p className="small muted diagram-legend">
        solid = request/response · dashed = async events · red arc = these
        choices fight (hover it) · shape set by your Architecture Style
      </p>
    </div>
  );
}
