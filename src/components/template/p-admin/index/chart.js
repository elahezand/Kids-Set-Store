"use client";
import {
    ResponsiveContainer, LineChart, Line, BarChart, Bar,
    CartesianGrid, XAxis, YAxis, Tooltip, Legend,
} from "recharts";

const sampleData = [
    { name: "Jan", uv: 4000, pv: 2400 },
    { name: "Feb", uv: 3000, pv: 1398 },
    { name: "Mar", uv: 2000, pv: 9800 },
    { name: "Apr", uv: 2780, pv: 3908 },
    { name: "May", uv: 1890, pv: 4800 },
    { name: "Jun", uv: 2390, pv: 3800 },
    { name: "Jul", uv: 3490, pv: 4300 },
];

const SAGE = "#358d5b";
const CORAL = "#ff8c61";
const GRID = "rgba(140,140,140,0.18)";
const AXIS = { fontSize: 12, fill: "#8c8c8c" };
const tooltipStyle = { borderRadius: 12, border: "1px solid #ebebeb", boxShadow: "0 12px 32px -8px rgba(16,24,40,.18)", fontSize: 13 };

export default function Chart({ type = "LineChart", data }) {
    const chartData = data || sampleData;

    return (
        <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
                {type === "LineChart" ? (
                    <LineChart data={chartData} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
                        <CartesianGrid stroke={GRID} vertical={false} />
                        <XAxis dataKey="name" tick={AXIS} axisLine={false} tickLine={false} />
                        <YAxis tick={AXIS} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Line type="monotone" dataKey="uv" name="Sales" stroke={SAGE} strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                    </LineChart>
                ) : (
                    <BarChart data={chartData} margin={{ top: 8, right: 12, bottom: 0, left: -12 }} barGap={4}>
                        <CartesianGrid stroke={GRID} vertical={false} />
                        <XAxis dataKey="name" tick={AXIS} axisLine={false} tickLine={false} />
                        <YAxis tick={AXIS} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(140,140,140,0.08)" }} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                        <Bar dataKey="pv" name="Visitors" fill={SAGE} radius={[6, 6, 0, 0]} maxBarSize={28} />
                        <Bar dataKey="uv" name="Orders" fill={CORAL} radius={[6, 6, 0, 0]} maxBarSize={28} />
                    </BarChart>
                )}
            </ResponsiveContainer>
        </div>
    );
}
