import React, { useState } from 'react';
import { Users, MapPin, Activity, Shield, Search, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LiveLocation } from '../types';
import { REAL_USER_PROFILES, REAL_USER_LOCATIONS } from '../data/velloreRealData';

interface UsersViewProps {
    locations: LiveLocation[];
}

export const UsersView: React.FC<UsersViewProps> = ({ locations }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'safe' | 'warning' | 'danger'>('all');
    const [selectedUser, setSelectedUser] = useState<LiveLocation | null>(null);

    // Merge real user data with location data
    const users = locations.map(loc => {
        const profile = REAL_USER_PROFILES.find(p => p.user_id === loc.user_id);
        const realLocation = REAL_USER_LOCATIONS.find(l => l.user_id === loc.user_id);

        return {
            ...loc,
            name: profile?.name || `User ${loc.user_id.split('-')[1]}`,
            phone: profile?.phone,
            email: profile?.email,
            emergencyContact: profile?.emergencyContact,
            totalAlerts: profile?.totalAlerts || 0,
            sosActivations: profile?.sosActivations || 0,
            status: realLocation?.zone_status === 'danger' ? 'danger'
                : realLocation?.zone_status === 'warning' ? 'warning'
                    : 'safe',
            battery: realLocation?.battery_level || Math.floor(Math.random() * 100),
            lastActive: 'Active now',
            is_sos_active: realLocation?.is_sos_active || false
        };
    });

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.user_id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: users.length,
        safe: users.filter(u => u.status === 'safe').length,
        warning: users.filter(u => u.status === 'warning').length,
        danger: users.filter(u => u.status === 'danger').length
    };

    return (
        <div className="h-full w-full bg-[#09090b] overflow-y-auto">
            <div className="p-6 space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                <Users className="w-5 h-5 text-blue-400" />
                            </div>
                            User Management
                        </h1>
                        <p className="text-sm text-zinc-500 mt-1">Connected users and location tracking</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20">
                            <Download className="w-4 h-4 mr-2" />
                            Export Users
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-4">
                    <div className="bg-[#18181b] border border-white/10 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                <Users className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                        </div>
                        <p className="text-2xl font-bold text-zinc-100">{stats.total}</p>
                        <p className="text-xs text-zinc-500 mt-1">Total Users</p>
                    </div>

                    <div className="bg-[#18181b] border border-white/10 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                <Shield className="w-5 h-5 text-emerald-400" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-emerald-400">{stats.safe}</p>
                        <p className="text-xs text-zinc-500 mt-1">Safe Zones</p>
                    </div>

                    <div className="bg-[#18181b] border border-white/10 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                                <Activity className="w-5 h-5 text-yellow-400" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-yellow-400">{stats.warning}</p>
                        <p className="text-xs text-zinc-500 mt-1">Caution Zones</p>
                    </div>

                    <div className="bg-[#18181b] border border-white/10 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-red-400" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-red-400">{stats.danger}</p>
                        <p className="text-xs text-zinc-500 mt-1">Danger Zones</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-[#18181b] border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name or ID..."
                                className="w-full pl-10 pr-4 py-2 bg-[#09090b] border border-white/10 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="flex gap-2">
                            {(['all', 'safe', 'warning', 'danger'] as const).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-4 py-2 rounded-lg text-xs font-medium uppercase tracking-wide transition-all ${statusFilter === status
                                        ? status === 'safe' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                            : status === 'warning' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                                : status === 'danger' ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                        : 'bg-white/5 text-zinc-500 hover:text-zinc-300 border border-transparent'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-[#18181b] border border-white/10 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[#09090b] border-b border-white/10">
                                <tr>
                                    <th className="text-left p-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">User</th>
                                    <th className="text-left p-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                                    <th className="text-left p-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Location</th>
                                    <th className="text-left p-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Speed</th>
                                    <th className="text-left p-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Battery</th>
                                    <th className="text-left p-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Last Active</th>
                                    <th className="text-left p-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredUsers.map((user, i) => (
                                    <tr
                                        key={i}
                                        onClick={() => setSelectedUser(user)}
                                        className="hover:bg-white/5 transition-colors cursor-pointer"
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${user.status === 'safe' ? 'bg-emerald-500' :
                                                    user.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                                                    } animate-pulse`} />
                                                <div>
                                                    <p className="text-sm font-medium text-zinc-100">{user.name}</p>
                                                    <p className="text-xs text-zinc-500">{user.user_id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium uppercase ${user.status === 'safe' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                                user.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                                    'bg-red-500/20 text-red-400 border border-red-500/30'
                                                }`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-1 text-xs text-zinc-400">
                                                <MapPin className="w-3 h-3" />
                                                {user.latitude.toFixed(4)}, {user.longitude.toFixed(4)}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm text-zinc-300">
                                                {user.speed ? `${user.speed.toFixed(1)} m/s` : 'N/A'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-2 bg-[#09090b] rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${user.battery > 50 ? 'bg-emerald-500' :
                                                            user.battery > 20 ? 'bg-yellow-500' : 'bg-red-500'
                                                            }`}
                                                        style={{ width: `${user.battery}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-zinc-400">{user.battery}%</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-xs text-zinc-500">{user.lastActive}</span>
                                        </td>
                                        <td className="p-4">
                                            <Button size="sm" className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20">
                                                View
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredUsers.length === 0 && (
                        <div className="text-center py-12">
                            <Filter className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                            <p className="text-sm text-zinc-500">No users match your filters</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};
