import React, { useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, MapPin, Clock, Calendar, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VELLORE_CRIME_ANALYTICS } from '../data/velloreRealData';

interface AnalyticsViewProps {
    zones: any[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ zones }) => {
    const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');

    // Use real Vellore crime analytics data
    const stats = {
        totalIncidents: VELLORE_CRIME_ANALYTICS.totalIncidents,
        incidentChange: +12,
        avgResponseTime: `${VELLORE_CRIME_ANALYTICS.responseTimeStats.average} min`,
        responseChange: -8,
        activeZones: zones.length,
        zoneChange: +2,
        usersProtected: 1247,
        userChange: +156
    };

    const incidentsByZone = VELLORE_CRIME_ANALYTICS.zoneStats.slice(0, 3).map(zone => ({
        zone: zone.zone,
        count: zone.incidents,
        severity: zone.severity,
        trend: zone.trend
    }));

    const timeSeriesData = VELLORE_CRIME_ANALYTICS.incidentsByMonth;

    const maxIncidents = Math.max(...timeSeriesData.map(d => d.count));

    return (
        <div className="h-full w-full bg-[#09090b] overflow-y-auto">
            <div className="p-6 space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                                <BarChart3 className="w-5 h-5 text-cyan-400" />
                            </div>
                            Analytics & Reports
                        </h1>
                        <p className="text-sm text-zinc-500 mt-1">Historical crime data, heatmaps, and trend analysis</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Time Range Selector */}
                        <div className="flex gap-1 bg-[#18181b] border border-white/10 rounded-lg p-1">
                            {(['24h', '7d', '30d', '90d'] as const).map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${timeRange === range
                                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                        : 'text-zinc-500 hover:text-zinc-300'
                                        }`}
                                >
                                    {range === '24h' ? '24 Hours' : range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                                </button>
                            ))}
                        </div>

                        <Button className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20">
                            <Download className="w-4 h-4 mr-2" />
                            Export Report
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-4">
                    <StatCard
                        title="Total Incidents"
                        value={stats.totalIncidents}
                        change={stats.incidentChange}
                        icon={<BarChart3 className="w-5 h-5" />}
                        color="red"
                    />
                    <StatCard
                        title="Avg Response Time"
                        value={stats.avgResponseTime}
                        change={stats.responseChange}
                        icon={<Clock className="w-5 h-5" />}
                        color="blue"
                    />
                    <StatCard
                        title="Active Zones"
                        value={stats.activeZones}
                        change={stats.zoneChange}
                        icon={<MapPin className="w-5 h-5" />}
                        color="purple"
                    />
                    <StatCard
                        title="Users Protected"
                        value={stats.usersProtected}
                        change={stats.userChange}
                        icon={<TrendingUp className="w-5 h-5" />}
                        color="emerald"
                    />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-2 gap-6">

                    {/* Incident Trend Chart */}
                    <div className="bg-[#18181b] border border-white/10 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-zinc-100">Incident Trend</h3>
                                <p className="text-xs text-zinc-500 mt-1">Last 7 days</p>
                            </div>
                            <Calendar className="w-5 h-5 text-zinc-500" />
                        </div>

                        {/* Simple Bar Chart */}
                        <div className="space-y-3">
                            {timeSeriesData.map((data, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <span className="text-xs text-zinc-500 w-8">{data.month}</span>
                                    <div className="flex-1 bg-[#09090b] rounded-full h-8 relative overflow-hidden">
                                        <div
                                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500/20 to-cyan-500/40 border-r-2 border-cyan-500 rounded-full transition-all duration-500"
                                            style={{ width: `${(data.count / maxIncidents) * 100}%` }}
                                        />
                                        <span className="absolute inset-0 flex items-center justify-end pr-3 text-xs font-medium text-cyan-400">
                                            {data.count}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Incidents by Zone */}
                    <div className="bg-[#18181b] border border-white/10 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-zinc-100">Incidents by Zone</h3>
                                <p className="text-xs text-zinc-500 mt-1">Top risk areas</p>
                            </div>
                            <MapPin className="w-5 h-5 text-zinc-500" />
                        </div>

                        <div className="space-y-4">
                            {incidentsByZone.map((zone, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-[#09090b] rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${zone.severity === 'HIGH' ? 'bg-red-500' : 'bg-yellow-500'
                                            }`} />
                                        <div>
                                            <p className="text-sm font-medium text-zinc-100">{zone.zone}</p>
                                            <p className="text-xs text-zinc-500">{zone.severity} Risk</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg font-bold text-zinc-100">{zone.count}</span>
                                        {zone.trend === 'up' && <TrendingUp className="w-4 h-4 text-red-400" />}
                                        {zone.trend === 'down' && <TrendingDown className="w-4 h-4 text-emerald-400" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Heatmap Section */}
                <div className="bg-[#18181b] border border-white/10 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-zinc-100">Risk Heatmap</h3>
                            <p className="text-xs text-zinc-500 mt-1">Geographic distribution of incidents</p>
                        </div>
                        <Button size="sm" className="bg-white/5 hover:bg-white/10 text-zinc-400">
                            <Filter className="w-4 h-4 mr-2" />
                            Configure
                        </Button>
                    </div>

                    <div className="bg-[#09090b] rounded-lg p-8 border border-white/5">
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500/20 to-yellow-500/20 mx-auto mb-4 flex items-center justify-center">
                                <MapPin className="w-8 h-8 text-red-400" />
                            </div>
                            <p className="text-sm text-zinc-400">Interactive heatmap visualization</p>
                            <p className="text-xs text-zinc-600 mt-1">Integration with Mapbox GL coming soon</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

// Stat Card Component
interface StatCardProps {
    title: string;
    value: string | number;
    change: number;
    icon: React.ReactNode;
    color: 'red' | 'blue' | 'purple' | 'emerald';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, color }) => {
    const isPositive = change > 0;

    const colorClasses = {
        red: 'bg-red-500/10 border-red-500/20 text-red-400',
        blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
        purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
        emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
    };

    return (
        <div className="bg-[#18181b] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all">
            <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center border`}>
                    {icon}
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(change)}%
                </div>
            </div>
            <div>
                <p className="text-2xl font-bold text-zinc-100">{value}</p>
                <p className="text-xs text-zinc-500 mt-1">{title}</p>
            </div>
        </div>
    );
};
