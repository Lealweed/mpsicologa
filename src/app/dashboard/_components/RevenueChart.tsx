"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import styles from "./RevenueChart.module.css";

export type RevenueChartPoint = {
  mes: string;
  receita: number;
  meta: number;
};

const DEFAULT_DATA: RevenueChartPoint[] = [
  { mes: "Out", receita: 0, meta: 0 },
  { mes: "Nov", receita: 0, meta: 0 },
  { mes: "Dez", receita: 0, meta: 0 },
  { mes: "Jan", receita: 0, meta: 0 },
  { mes: "Fev", receita: 0, meta: 0 },
  { mes: "Mar", receita: 0, meta: 0 },
];

function fmt(v: number) {
  return `R$ ${(v / 1000).toFixed(1)}k`;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
}) {
  if (active && payload?.length) {
    return (
      <div className={styles.tooltip}>
        <div className={styles.tooltipLabel}>{label}</div>
        {payload.map((p) => (
          <div key={p.dataKey} className={styles.tooltipRow}>
            <span
              className={
                p.dataKey === "receita"
                  ? styles.dotPrimary
                  : styles.dotMeta
              }
            />
            <span>
              {p.dataKey === "receita" ? "Receita" : "Meta"}:{" "}
              <strong>
                R${" "}
                {p.value.toLocaleString("pt-BR", {
                  minimumFractionDigits: 0,
                })}
              </strong>
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function RevenueChart({
  data = DEFAULT_DATA,
}: {
  data?: RevenueChartPoint[];
}) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.chartHeader}>
        <span className={styles.chartTitle}>Receita mensal</span>
        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={styles.dotPrimary} /> Receita
          </span>
          <span className={styles.legendItem}>
            <span className={styles.dotMeta} /> Meta
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart
          data={data}
          margin={{ top: 8, right: 4, left: -8, bottom: 0 }}
        >
          <defs>
            <linearGradient id="gradReceita" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#9D7280" stopOpacity={0.16} />
              <stop offset="95%" stopColor="#9D7280" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="2 6"
            stroke="rgba(157,114,128,0.12)"
            vertical={false}
          />
          <XAxis
            dataKey="mes"
            tick={{ fontSize: 12, fill: "#78696A", fontFamily: "Raleway" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#78696A", fontFamily: "Raleway" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={fmt}
            width={42}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="receita"
            stroke="#9D7280"
            strokeWidth={2.5}
            fill="url(#gradReceita)"
            dot={{ fill: "#9D7280", r: 4, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "#9D7280" }}
          />
          <Area
            type="monotone"
            dataKey="meta"
            stroke="#C8A89B"
            strokeWidth={1.5}
            strokeDasharray="5 3"
            fill="none"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
