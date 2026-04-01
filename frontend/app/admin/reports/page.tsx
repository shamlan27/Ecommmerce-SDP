'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { AdminOverview } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface SalesReport {
    daily: { date: string; revenue: number; orders: number; subtotal: number; tax: number }[];
    summary: { total_revenue: number; total_orders: number; average_order_value: number };
}

export default function ReportsPage() {
    const [overview, setOverview] = useState<AdminOverview | null>(null);
    const [sales, setSales] = useState<SalesReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [from, setFrom] = useState(new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10));
    const [to, setTo] = useState(new Date().toISOString().slice(0, 10));

    const loadReports = async () => {
        setLoading(true);
        try {
            const [overviewData, salesData] = await Promise.all([
                api.get<AdminOverview>('/admin/reports/overview'),
                api.get<SalesReport>(`/admin/reports/sales?from=${from}&to=${to}`),
            ]);
            setOverview(overviewData);
            setSales(salesData);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReports();
    }, []);

    if (loading || !overview || !sales) {
        return <div className="p-8">Loading reports...</div>;
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Sales Reports</h1>
                    <p className="text-muted text-sm mt-1">Revenue, orders, and trend breakdowns.</p>
                </div>
                <div className="flex items-end gap-2">
                    <div>
                        <label className="text-xs text-muted block mb-1">From</label>
                        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="px-3 py-2 rounded-xl border border-border bg-background text-sm" />
                    </div>
                    <div>
                        <label className="text-xs text-muted block mb-1">To</label>
                        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="px-3 py-2 rounded-xl border border-border bg-background text-sm" />
                    </div>
                    <button onClick={loadReports} className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold">Apply</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl border border-border bg-background">
                    <p className="text-xs text-muted uppercase tracking-wider">Revenue</p>
                    <p className="text-2xl font-bold mt-1">{formatCurrency(sales.summary.total_revenue)}</p>
                </div>
                <div className="p-5 rounded-2xl border border-border bg-background">
                    <p className="text-xs text-muted uppercase tracking-wider">Orders</p>
                    <p className="text-2xl font-bold mt-1">{sales.summary.total_orders}</p>
                </div>
                <div className="p-5 rounded-2xl border border-border bg-background">
                    <p className="text-xs text-muted uppercase tracking-wider">Average Order</p>
                    <p className="text-2xl font-bold mt-1">{formatCurrency(sales.summary.average_order_value)}</p>
                </div>
            </div>

            <div className="p-5 rounded-2xl border border-border bg-background">
                <h2 className="text-lg font-bold mb-4">Daily Sales</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="text-left text-muted border-b border-border">
                                <th className="py-2 pr-4">Date</th>
                                <th className="py-2 pr-4">Orders</th>
                                <th className="py-2 pr-4">Revenue</th>
                                <th className="py-2 pr-4">Tax</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sales.daily.map((row) => (
                                <tr key={row.date} className="border-b border-border/60">
                                    <td className="py-2 pr-4">{row.date}</td>
                                    <td className="py-2 pr-4">{row.orders}</td>
                                    <td className="py-2 pr-4 font-semibold">{formatCurrency(Number(row.revenue))}</td>
                                    <td className="py-2 pr-4">{formatCurrency(Number(row.tax))}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="p-5 rounded-2xl border border-border bg-background">
                <h2 className="text-lg font-bold mb-4">Overview Snapshot</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div><span className="text-muted">Customers</span><p className="font-bold text-lg">{overview.stats.total_customers}</p></div>
                    <div><span className="text-muted">Products</span><p className="font-bold text-lg">{overview.stats.total_products}</p></div>
                    <div><span className="text-muted">Pending Orders</span><p className="font-bold text-lg">{overview.stats.pending_orders}</p></div>
                    <div><span className="text-muted">Low Stock</span><p className="font-bold text-lg">{overview.stats.low_stock_products}</p></div>
                </div>
            </div>
        </div>
    );
}
