"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { HistoricalLSTPoint } from "@/types";

interface HistoricalChartProps {
  data: HistoricalLSTPoint[];
}

export function HistoricalChart({ data }: HistoricalChartProps) {
  // Format dates for compact X-Axis labels: "2025-06-25" -> "25 Jun"
  const formattedData = data.map((d) => {
    const parts = d.date.split("-");
    const day = parts[2];
    const month =
      parts[1] === "06" ? "Jun" : parts[1] === "07" ? "Jul" : parts[1];
    return {
      ...d,
      displayDate: `${day} ${month}`,
      delta: Number((d.temp - d.baseline).toFixed(1)),
    };
  });

  return (
    <div className="w-full h-[220px] select-none">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={formattedData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="lstGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
          <XAxis
            dataKey="displayDate"
            tick={{ fontSize: 10, fill: "#64748B" }}
            axisLine={{ stroke: "#CBD5E1" }}
            tickLine={false}
          />
          <YAxis
            domain={["dataMin - 1", "dataMax + 1"]}
            tick={{ fontSize: 10, fill: "#64748B" }}
            axisLine={false}
            tickLine={false}
            unit="°C"
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="rounded-lg border border-border bg-surface-white/95 backdrop-blur-md p-2.5 shadow-md text-xs font-sans">
                    <span className="font-bold text-text-primary block mb-1">
                      {item.date}
                    </span>
                    <div className="flex items-center justify-between gap-3 text-text-secondary text-[11px]">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                        Observed LST:
                      </span>
                      <span className="font-mono font-bold text-text-primary">
                        {item.temp}°C
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-text-secondary text-[11px] mt-0.5">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-slate-400"></span>
                        10-Yr Baseline:
                      </span>
                      <span className="font-mono text-text-secondary">
                        {item.baseline}°C
                      </span>
                    </div>
                    <div className="mt-1 pt-1 border-t border-border flex items-center justify-between gap-3 text-[10px] font-semibold text-rose-600">
                      <span>Thermal Spike:</span>
                      <span className="font-mono">+{item.delta}°C</span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ fontSize: "11px", paddingBottom: "6px" }}
          />
          <Area
            type="monotone"
            dataKey="temp"
            name="Landsat-9 Observed LST"
            stroke="#F43F5E"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#lstGradient)"
          />
          <Line
            type="monotone"
            dataKey="baseline"
            name="10-Yr Climatological Baseline"
            stroke="#94A3B8"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
