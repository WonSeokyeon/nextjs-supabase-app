"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DailyTrendPoint {
  date: string; // "MM/DD"
  count: number;
}

interface StatusDistributionPoint {
  label: string;
  count: number;
}

// dataviz 스킬 검증 카테고리 팔레트(고정 순서: slot1 blue/slot2 orange/slot3 aqua) — app/globals.css의 --chart-1~3
const STATUS_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
];

export function EventTrendChart({ data }: { data: DailyTrendPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">최근 7일 이벤트 생성 추이</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
          >
            <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              width={24}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
                fontSize: 12,
              }}
              labelStyle={{ color: "hsl(var(--popover-foreground))" }}
            />
            <Line
              type="monotone"
              dataKey="count"
              name="생성된 이벤트"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              dot={{ r: 4, fill: "hsl(var(--chart-1))" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function EventStatusChart({
  data,
}: {
  data: StatusDistributionPoint[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">이벤트 상태별 분포</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 16, right: 16, left: 0, bottom: 0 }}
          >
            <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              width={24}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
                fontSize: 12,
              }}
              labelStyle={{ color: "hsl(var(--popover-foreground))" }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={entry.label}
                  fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                />
              ))}
              <LabelList
                dataKey="count"
                position="top"
                style={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
