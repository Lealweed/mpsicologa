"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import styles from "./SessionsChart.module.css";

const data = [
  { dia: "Seg", sessoes: 5 },
  { dia: "Ter", sessoes: 8 },
  { dia: "Qua", sessoes: 6 },
  { dia: "Qui", sessoes: 9 },
  { dia: "Sex", sessoes: 4 },
  { dia: "Sáb", sessoes: 2 },
];

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (active && payload?.length) {
    return (
      <div className={styles.tooltip}>
        <div className={styles.tooltipLabel}>{label}</div>
        <div className={styles.tooltipValue}>{payload[0].value} sessões</div>
      </div>
    );
  }
  return null;
}

export default function SessionsChart() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.chartHeader}>
        <span className={styles.chartTitle}>Sessões por dia</span>
        <span className={styles.chartBadge}>Esta semana</span>
      </div>
      <ResponsiveContainer width="100%" height={195}>
        <BarChart
          data={data}
          barSize={30}
          margin={{ top: 4, right: 4, left: -22, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="2 6"
            stroke="rgba(157,114,128,0.12)"
            vertical={false}
          />
          <XAxis
            dataKey="dia"
            tick={{ fontSize: 12, fill: "#78696A", fontFamily: "Raleway" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#78696A", fontFamily: "Raleway" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(157,114,128,0.06)", radius: 6 }}
          />
          <Bar dataKey="sessoes" fill="#9D7280" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
