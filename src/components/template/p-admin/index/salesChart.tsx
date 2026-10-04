"use client";

import { useState } from "react";
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAdminStats } from "@/services/client/admin";
import { formatPrice } from "@/utils/format";

const RANGES = [7, 30, 90] as const;
type Range = (typeof RANGES)[number];

// brand colors from @theme in globals.css (recharts needs real values, not classes)
const SAGE = "#358d5b";
const CORAL = "#ff8c61";
const GRID = "rgba(140,140,140,0.18)";
const AXIS = { fontSize: 12, fill: "#8c8c8c" };
const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #ebebeb",
  boxShadow: "0 12px 32px -8px rgba(16,24,40,.18)",
  fontSize: 13,
};

const shortDay = (day: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(day));

export default function SalesChart() {
  const [days, setDays] = useState<Range>(30);
  const { data, isLoading } = useAdminStats(days);
  const points = data?.data?.points ?? [];

  const totals = points.reduce(
    (sum, point) => ({ orders: sum.orders + point.orders, revenue: sum.revenue + point.revenue }),
    {
      orders: 0,
      revenue: 0,
    }
  );

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">Sales</h2>
          <p className="mt-0.5 text-xs text-gray-700 tabular-nums dark:text-gray-500">
            {totals.orders.toLocaleString("en-US")} orders · {formatPrice(totals.revenue)} revenue in the last {days}{" "}
            days
          </p>
        </div>
        <div role="tablist" className="flex gap-1 rounded-xl bg-gray-100 p-1 dark:bg-white/5">
          {RANGES.map((range) => (
            <button
              key={range}
              type="button"
              role="tab"
              aria-selected={range === days}
              onClick={() => setDays(range)}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                range === days
                  ? "bg-white text-sage-700 shadow-card dark:bg-ink-800 dark:text-sage-300"
                  : "text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              }`}
            >
              {range}d
            </button>
          ))}
        </div>
      </div>

      <div className="card-body">
        {isLoading ? (
          <div className="skeleton h-72 w-full" />
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={points} margin={{ top: 8, right: 4, bottom: 0, left: -12 }}>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis
                  dataKey="day"
                  tickFormatter={shortDay}
                  tick={AXIS}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={24}
                />
                <YAxis yAxisId="orders" allowDecimals={false} tick={AXIS} axisLine={false} tickLine={false} />
                <YAxis yAxisId="revenue" orientation="right" hide />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{ fill: "rgba(140,140,140,0.08)" }}
                  labelFormatter={(day) => shortDay(String(day))}
                  formatter={(value, name) => (name === "Revenue" ? formatPrice(Number(value)) : value)}
                />
                <Bar
                  yAxisId="orders"
                  dataKey="orders"
                  name="Orders"
                  fill={SAGE}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={22}
                />
                <Line
                  yAxisId="revenue"
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke={CORAL}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="mt-3 flex items-center gap-4 text-xs text-gray-700 dark:text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm" style={{ background: SAGE }} /> Orders
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-3 rounded-full" style={{ background: CORAL }} /> Revenue
          </span>
        </div>
      </div>
    </section>
  );
}
