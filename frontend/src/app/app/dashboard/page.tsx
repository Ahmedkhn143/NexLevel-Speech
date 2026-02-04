'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Play, Clock, ArrowRight, Zap, Star } from 'lucide-react';
import { useAuthStore } from '@/stores';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { api } from '@/lib/api'; // Assumption: api client exists

interface Generation {
    id: string;
    text: string;
    createdAt: string;
    voice: { name: string };
    duration: number;
}

export default function DashboardPage() {
    const { user } = useAuthStore();
    const [recentGenerations, setRecentGenerations] = useState<Generation[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    useEffect(() => {
        // Fetch recent generations
        const fetchHistory = async () => {
            try {
                const { data } = await api.get('/tts/history?limit=5');
                setRecentGenerations(data.data || []);
            } catch (error) {
                console.error('Failed to fetch history', error);
                // Optionally show toast, but silent fail is better for dashboard widgets to avoid spam
                setRecentGenerations([]);
            } finally {
                setLoadingHistory(false);
            }
        };
        fetchHistory();
    }, []);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8"
        >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold">
                        Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0] || 'Creator'}</span>
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Here's what's happening with your creative studio today.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link href="/app/voices">
                        <Button variant="secondary" icon={<Plus className="w-4 h-4" />}>
                            Clone Voice
                        </Button>
                    </Link>
                    <Link href="/app/tts">
                        <Button variant="primary" icon={<Zap className="w-4 h-4" />}>
                            Generate Speech
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Plan Card */}
                <Card glass hover className="relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Star className="w-24 h-24" />
                    </div>
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Current Plan</h3>
                    <div className="text-3xl font-bold text-white mb-1">
                        {user?.subscription?.planId ? 'Pro Plan' : 'Starter'}
                    </div>
                    <p className="text-sm text-green-400 font-medium flex items-center gap-1">
                        Active <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    </p>
                    <div className="mt-4 text-xs text-muted-foreground">
                        Renews {user?.subscription?.currentPeriodEnd ? new Date(user.subscription.currentPeriodEnd).toLocaleDateString() : 'Monthly'}
                    </div>
                </Card>

                {/* Credits Card */}
                <Card glass hover className="relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Zap className="w-24 h-24" />
                    </div>
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Available Credits</h3>
                    <div className="text-3xl font-bold gradient-text mb-1">
                        {((user?.credits?.totalCredits || 0) - (user?.credits?.usedCredits || 0) + (user?.credits?.bonusCredits || 0)).toLocaleString()}
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5 mt-2">
                        <div
                            className="bg-primary h-1.5 rounded-full"
                            style={{ width: `${Math.min(100, ((user?.credits?.totalCredits || 1) - (user?.credits?.usedCredits || 0)) / (user?.credits?.totalCredits || 1) * 100)}%` }}
                        />
                    </div>
                    <div className="mt-4 text-xs text-muted-foreground">
                        Total allocated: {user?.credits?.totalCredits?.toLocaleString() || 0}
                    </div>
                </Card>

                {/* Usage Card (Placeholder for now) */}
                <Card glass hover className="relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Clock className="w-24 h-24" />
                    </div>
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Usage This Month</h3>
                    <div className="text-3xl font-bold text-white mb-1">
                        {user?.credits?.usedCredits?.toLocaleString() || 0} <span className="text-lg font-normal text-muted-foreground">chars</span>
                    </div>
                    <div className="mt-4 text-xs text-muted-foreground flex items-center gap-1">
                        <ArrowRight className="w-3 h-3" /> View full analytics
                    </div>
                </Card>
            </div>

            {/* Recent Activity */}
            <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                    <h2 className="text-xl font-semibold">Recent Generations</h2>
                    <Link href="/app/history" className="text-sm text-primary hover:text-primary/80 transition-colors">
                        View All
                    </Link>
                </div>

                <Card className="p-0 overflow-hidden bg-card/50">
                    {loadingHistory ? (
                        <div className="p-6 space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <Skeleton className="w-10 h-10 rounded-full" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-4 w-1/3" />
                                        <Skeleton className="h-3 w-1/4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : recentGenerations.length > 0 ? (
                        <div className="divide-y divide-border">
                            {recentGenerations.map((gen) => (
                                <motion.div
                                    variants={item}
                                    key={gen.id}
                                    className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors group cursor-pointer"
                                >
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <Play className="w-4 h-4 fill-current" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-medium text-white truncate">{gen.text}</h4>
                                        <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                                            <span>{gen.voice.name}</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-600" />
                                            <span>{new Date(gen.createdAt).toLocaleDateString()}</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-600" />
                                            <span>{gen.duration.toFixed(1)}s</span>
                                        </p>
                                    </div>
                                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        Download
                                    </Button>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                                <Clock className="w-6 h-6 text-gray-500" />
                            </div>
                            <p>No recent generations found.</p>
                            <Link href="/app/tts" className="mt-4">
                                <Button size="sm" variant="secondary">Start Generating</Button>
                            </Link>
                        </div>
                    )}
                </Card>
            </div>
        </motion.div>
    );
}
