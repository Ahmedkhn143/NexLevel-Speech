'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Calendar, Loader2 } from 'lucide-react';
import { usageApi } from '@/lib/api';
import { UsageStats } from '@/types';

export default function UsagePage() {
    const [stats, setStats] = useState<UsageStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const { data } = await usageApi.getStats();
            setStats(data);
        } catch (error) {
            console.error('Failed to load stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    const usagePercent = stats
        ? ((stats.credits.used / stats.credits.total) * 100) || 0
        : 0;

    return (
        <div className="max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold mb-2">Usage & Credits</h1>
                <p className="text-gray-400">
                    Monitor your credit usage and generation statistics
                </p>
            </motion.div>

            {/* Credits Overview */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card mb-8"
            >
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">Credits Overview</h2>
                        <p className="text-sm text-gray-400">Current billing period</p>
                    </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-6 mb-6">
                    <div>
                        <div className="text-sm text-gray-400">Available</div>
                        <div className="text-2xl font-bold gradient-text">
                            {stats?.credits.available.toLocaleString() || 0}
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-400">Used</div>
                        <div className="text-2xl font-bold">
                            {stats?.credits.used.toLocaleString() || 0}
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-400">Total</div>
                        <div className="text-2xl font-bold">
                            {stats?.credits.total.toLocaleString() || 0}
                        </div>
                    </div>
                </div>

                <div className="mb-3">
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                        <span>{usagePercent.toFixed(1)}% used</span>
                        <span>Resets: {stats?.credits.nextResetAt
                            ? new Date(stats.credits.nextResetAt).toLocaleDateString()
                            : 'N/A'
                        }</span>
                    </div>
                    <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                            className={`h-full rounded-full ${usagePercent > 90
                                    ? 'bg-red-500'
                                    : usagePercent > 70
                                        ? 'bg-yellow-500'
                                        : 'bg-gradient-to-r from-blue-500 to-purple-500'
                                }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${usagePercent}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                        />
                    </div>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                        <span className="text-sm text-gray-400">This Month</span>
                    </div>
                    <div className="text-3xl font-bold mb-1">
                        {stats?.thisMonth.generationCount.toLocaleString() || 0}
                    </div>
                    <div className="text-sm text-gray-400">
                        generations ({stats?.thisMonth.charactersGenerated.toLocaleString() || 0} chars)
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="card"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <Calendar className="w-5 h-5 text-blue-400" />
                        <span className="text-sm text-gray-400">Voice Clones</span>
                    </div>
                    <div className="text-3xl font-bold mb-1">{stats?.voiceCount || 0}</div>
                    <div className="text-sm text-gray-400">active voices</div>
                </motion.div>
            </div>
        </div>
    );
}
