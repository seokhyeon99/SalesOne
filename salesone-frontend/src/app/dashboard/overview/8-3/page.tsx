"use client";

import React from "react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "1분기", "신규 사용자": 108, "누적 사용자": 105, "월간 반복 매출": 9300000 },
  { name: "2분기", "신규 사용자": 237, "누적 사용자": 321, "월간 반복 매출": 28600000 },
  { name: "3분기", "신규 사용자": 446, "누적 사용자": 694, "월간 반복 매출": 60300000 },
  { name: "4분기", "신규 사용자": 610, "누적 사용자": 1194, "월간 반복 매출": 106500000 },
  { name: "5분기", "신규 사용자": 797, "누적 사용자": 1811, "월간 반복 매출": 162100000 },
  { name: "6분기", "신규 사용자": 1006, "누적 사용자": 2604, "월간 반복 매출": 230000000 },
  { name: "7분기", "신규 사용자": 1028, "누적 사용자": 3371, "월간 반복 매출": 300000000 },
  { name: "8분기", "신규 사용자": 1092, "누적 사용자": 4129, "월간 반복 매출": 370000000 },
];

const formatUserYAxis = (tickItem: number) => {
  return `${tickItem.toLocaleString()}명`;
};

const formatMrrYAxis = (tickItem: number) => {
  if (tickItem >= 100000000) {
    return `${(tickItem / 100000000).toFixed(1)}억 원`;
  }
  if (tickItem >= 10000) {
    return `${(tickItem / 10000).toLocaleString()}만 원`;
  }
  return `${tickItem.toLocaleString()}원`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-4 bg-background border rounded-md shadow-lg">
        <p className="font-bold text-foreground">{label}</p>
        {payload.map((pld: any) => (
          <p key={pld.dataKey} style={{ color: pld.color }}>
            {pld.dataKey}:{' '}
            {pld.dataKey === '월간 반복 매출'
              ? formatMrrYAxis(pld.value)
              : formatUserYAxis(pld.value)}
          </p>
        ))}
      </div>
    );
  }

  return null;
};

export default function GrowthChart() {
  return (
    <div className="w-full bg-card p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-4 text-center text-card-foreground">
            사용자 및 매출 성장 전망
        </h2>
      <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%' }}>
          <div
              style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  top: 0,
              }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={data}
                margin={{
                  top: 20,
                  right: 40,
                  left: 40,
                  bottom: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis
                  yAxisId="left"
                  tickFormatter={formatUserYAxis}
                  stroke="hsl(var(--muted-foreground))"
                  label={{ value: '사용자 수 (명)', angle: -90, position: 'insideLeft', fill: 'hsl(var(--foreground))', dy: -20 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={formatMrrYAxis}
                  stroke="hsl(var(--muted-foreground))"
                  label={{ value: '월간 반복 매출 (원)', angle: 90, position: 'insideRight', fill: 'hsl(var(--foreground))', dy: 20 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar yAxisId="left" dataKey="신규 사용자" fill="#A8DBC3" name="신규 사용자" />
                <Line yAxisId="left" type="monotone" dataKey="누적 사용자" stroke="#7DC9A5" name="누적 사용자" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="월간 반복 매출" stroke="#334155" name="월간 반복 매출" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
      </div>
    </div>
  );
}
