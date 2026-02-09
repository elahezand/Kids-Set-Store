"use client"
import React from 'react'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Legend, Tooltip } from 'recharts';
import { BarChart, Bar, Rectangle, ResponsiveContainer } from 'recharts';

const data = [
    {
        name: 'Page A',
        uv: 4000,
        pv: 2400,
        amt: 2400,
    },
    {
        name: 'Page B',
        uv: 3000,
        pv: 1398,
        amt: 2210,
    },
    {
        name: 'Page C',
        uv: 2000,
        pv: 9800,
        amt: 2290,
    },
    {
        name: 'Page D',
        uv: 2780,
        pv: 3908,
        amt: 2000,
    },
    {
        name: 'Page E',
        uv: 1890,
        pv: 4800,
        amt: 2181,
    },
    {
        name: 'Page F',
        uv: 2390,
        pv: 3800,
        amt: 2500,
    },
    {
        name: 'Page G',
        uv: 3490,
        pv: 4300,
        amt: 2100,
    },
];


export default function Chart({ type, Data }) {
    const chartData = Data || data; 

    return (
        <div style={{ width: '100%', height: '300px' }}> 
            <ResponsiveContainer width="100%" height="100%">
                {type === "LineChart" ? (
                    <LineChart data={chartData} margin={{ top: 8, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid stroke="var(--coral)" strokeDasharray="5 5" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend align="right" />
                        <Line type="monotone" dataKey="uv" stroke="var(--sage)" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                ) : (
                    <BarChart data={chartData} margin={{ top: 8, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="pv" fill="var(--sage)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="uv" fill="var(--coral)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                )}
            </ResponsiveContainer>
        </div>
    );
}





