"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PerfPoint } from "@/lib/funds";

export function FundChart({ data }: { data: PerfPoint[] }) {
  const points = data.filter((d) => d.nav != null);
  if (points.length < 2) {
    return (
      <div className="flex h-64 items-center justify-center border border-slate/50 bg-cream-light text-sm text-navy-mute">
        Historique de valeur liquidative insuffisant pour ce fonds.
      </div>
    );
  }

  return (
    <div className="h-72 w-full border border-slate/50 bg-cream-light p-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="navFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#B08A3E" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#B08A3E" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#6B7789" }}
            tickFormatter={(d) => String(d).slice(0, 7)}
            minTickGap={40}
            stroke="#C3C9D2"
          />
          <YAxis
            domain={["auto", "auto"]}
            tick={{ fontSize: 11, fill: "#6B7789" }}
            width={56}
            stroke="#C3C9D2"
          />
          <Tooltip
            contentStyle={{
              background: "#0E1A2B",
              border: "none",
              borderRadius: 0,
              color: "#F6F2EA",
              fontSize: 12,
            }}
            labelStyle={{ color: "#CBA85E" }}
            formatter={(v: number) => [`${v?.toFixed?.(2) ?? v} MAD`, "VL"]}
          />
          <Area
            type="monotone"
            dataKey="nav"
            stroke="#B08A3E"
            strokeWidth={2}
            fill="url(#navFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
