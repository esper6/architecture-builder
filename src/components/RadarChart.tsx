import { useState } from "react";
import type { DimensionKey } from "../data/types";
import { DIMENSIONS } from "../data/dimensions";

export interface RadarSeries {
  id: string;
  name: string;
  /** CSS color value (typically `var(--series-n)`). Stable per entity. */
  color: string;
  values: Record<DimensionKey, number>;
}

interface Tooltip {
  x: number;
  y: number;
  dim: DimensionKey;
}

const W = 600;
const H = 400;
const CX = W / 2;
const CY = H / 2 + 4;
const R = 138;
const MAX = 10;

function angleOf(i: number): number {
  return (Math.PI * 2 * i) / DIMENSIONS.length - Math.PI / 2;
}

function pointAt(i: number, value: number): [number, number] {
  const a = angleOf(i);
  const r = (value / MAX) * R;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
}

/**
 * Multi-series radar. Chrome follows the dataviz rules: solid hairline grid,
 * 2px series strokes, low-opacity fills, generous hit targets, and an
 * accompanying legend + table rendered by the parent (tooltips enhance,
 * never gate).
 */
export function RadarChart({ series }: { series: RadarSeries[] }) {
  const [tip, setTip] = useState<Tooltip | null>(null);

  const rings = [2, 4, 6, 8, 10];

  return (
    <div className="radar-wrap">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Radar chart comparing ${series.map((s) => s.name).join(", ")} across ${DIMENSIONS.length} dimensions. Values are also in the table below.`}
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        {/* grid rings */}
        {rings.map((v) => (
          <polygon
            key={v}
            points={DIMENSIONS.map((_, i) => pointAt(i, v).join(",")).join(" ")}
            fill="none"
            stroke="var(--grid)"
            strokeWidth={1}
          />
        ))}
        {/* spokes */}
        {DIMENSIONS.map((d, i) => {
          const [x, y] = pointAt(i, MAX);
          return (
            <line
              key={d.key}
              x1={CX}
              y1={CY}
              x2={x}
              y2={y}
              stroke="var(--grid)"
              strokeWidth={1}
            />
          );
        })}
        {/* axis labels */}
        {DIMENSIONS.map((d, i) => {
          const a = angleOf(i);
          const lx = CX + (R + 26) * Math.cos(a);
          const ly = CY + (R + 20) * Math.sin(a);
          const anchor =
            Math.abs(Math.cos(a)) < 0.3
              ? "middle"
              : Math.cos(a) > 0
                ? "start"
                : "end";
          return (
            <text
              key={d.key}
              x={lx}
              y={ly}
              textAnchor={anchor}
              dominantBaseline="middle"
              fontSize={11.5}
              fill="var(--text-secondary)"
            >
              {d.label}
            </text>
          );
        })}
        {/* series polygons */}
        {series.map((s) => (
          <polygon
            key={s.id}
            points={DIMENSIONS.map((d, i) =>
              pointAt(i, s.values[d.key]).join(","),
            ).join(" ")}
            fill={s.color}
            fillOpacity={0.08}
            stroke={s.color}
            strokeWidth={2}
            strokeLinejoin="round"
          />
        ))}
        {/* vertices + hover targets (≥24px hit area via invisible circle) */}
        {series.map((s) =>
          DIMENSIONS.map((d, i) => {
            const [x, y] = pointAt(i, s.values[d.key]);
            return (
              <g key={`${s.id}-${d.key}`}>
                <circle cx={x} cy={y} r={3.5} fill={s.color} />
                <circle
                  cx={x}
                  cy={y}
                  r={13}
                  fill="transparent"
                  onMouseEnter={() => setTip({ x, y, dim: d.key })}
                  onMouseLeave={() => setTip(null)}
                />
              </g>
            );
          }),
        )}
      </svg>
      {tip && (
        <div
          className="radar-tooltip"
          style={{
            left: `${(tip.x / W) * 100}%`,
            top: `${(tip.y / H) * 100}%`,
            transform: "translate(-50%, calc(-100% - 10px))",
          }}
        >
          <strong>
            {DIMENSIONS.find((d) => d.key === tip.dim)?.label}
          </strong>
          {series.map((s) => (
            <div key={s.id} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <span
                className="swatch"
                style={{
                  background: s.color,
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  display: "inline-block",
                }}
              />
              <span className="secondary">{s.name}</span>
              <span style={{ marginLeft: "auto", fontVariantNumeric: "tabular-nums" }}>
                {s.values[tip.dim].toFixed(s.values[tip.dim] % 1 === 0 ? 0 : 1)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ChartLegend({
  series,
}: {
  series: { id: string; name: string; color: string }[];
}) {
  if (series.length < 2) return null;
  return (
    <div className="chart-legend" role="list">
      {series.map((s) => (
        <span className="legend-item" role="listitem" key={s.id}>
          <span className="swatch" style={{ background: s.color }} />
          {s.name}
        </span>
      ))}
    </div>
  );
}
