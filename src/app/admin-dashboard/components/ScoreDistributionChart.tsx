'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ScoreData {
    range: string;
    count: number;
}

interface ScoreDistributionChartProps {
    data: ScoreData[];
}

const ScoreDistributionChart = ({ data }: ScoreDistributionChartProps) => {
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    if (!isHydrated) {
        return <div className="h-64 animate-pulse bg-muted rounded-xl" />;
    }

    const COLORS = ['#cbd5e0', '#a0aec0', '#718096', '#4a5568', '#2d3748', '#1f66f2'];

    return (
        <div className="bg-card border border-border rounded-xl p-6 shadow-academic">
            <h3 className="font-heading text-lg font-bold text-foreground mb-6">Distribution des Scores</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                        <XAxis
                            dataKey="range"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#718096' }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#718096' }}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index === data.length - 1 ? '#1f66f2' : '#718096'} opacity={0.6 + (index * 0.08)} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ScoreDistributionChart;
