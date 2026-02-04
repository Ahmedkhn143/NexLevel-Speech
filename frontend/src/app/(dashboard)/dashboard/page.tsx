'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Mic, MessageSquare, TrendingUp, CreditCard, Plus, Play } from 'lucide-react';
import { useAuthStore } from '@/stores';

export default function DashboardPage() {
    const { user } = useAuthStore();

    const availableCredits = user?.credits
        ? user.credits.totalCredits - user.credits.usedCredits + user.credits.bonusCredits
        : 0;

    const stats = [
        {
            icon: CreditCard,
            label: 'Available Credits',
            value: availableCredits.toLocaleString(),
            color: 'from-blue-500 to-cyan-500',
        },
        {
            icon: Mic,
            label: 'Voice Clones',
            value: '0',
            color: 'from-purple-500 to-pink-500',
        },
        {
            icon: MessageSquare,
            label: 'Generations',
            value: '0',
            color: 'from-orange-500 to-red-500',
        },
        {
            icon: TrendingUp,
            label: 'This Month',
            value: '0',
            suffix: 'chars',
            color: 'from-green-500 to-emerald-500',
        },
    ];

    const quickActions = [
        {
            icon: Plus,
            title: 'Clone New Voice',
            description: 'Create a new AI voice clone from audio samples',
            href: '/dashboard/voices/clone',
            color: 'from-blue-500 to-purple-500',
        },
        {
            icon: Play,
            title: 'Generate Speech',
            description: 'Convert text to speech using your cloned voices',
            href: '/dashboard/generate',
            color: 'from-purple-500 to-pink-500',
        },
    ];

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold mb-2">
                    Welcome back, <span className="gradient-text">{user?.name || 'there'}</span>!
                </h1>
                <p className="text-gray-400">
                    Here's what's happening with your voice clones today.
                </p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        className="card h-full"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div
                                className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} p-0.5`}
                            >
                                <div className="w-full h-full rounded-xl bg-gray-900 flex items-center justify-center">
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>
                        <div className="text-2xl font-bold">
                            {stat.value}
                            {stat.suffix && (
                                <span className="text-sm text-gray-500 ml-1">{stat.suffix}</span>
                            )}
                        </div>
                        <div className="text-sm text-gray-400">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-8"
            >
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                    {quickActions.map((action) => (
                        <Link
                            key={action.title}
                            href={action.href}
                            className="card group hover:border-purple-500/50 h-full"
                        >
                            <div className="flex items-start gap-4">
                                <div
                                    className={`w-14 h-14 rounded-xl bg-gradient-to-r ${action.color} p-0.5 group-hover:scale-110 transition-transform`}
                                >
                                    <div className="w-full h-full rounded-xl bg-gray-900 flex items-center justify-center">
                                        <action.icon className="w-7 h-7 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-1">{action.title}</h3>
                                    <p className="text-gray-400 text-sm">{action.description}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </motion.div>

            {/* Current Plan */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <h2 className="text-xl font-semibold mb-4">Your Plan</h2>
                <div className="card bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="text-sm text-gray-400 mb-1">Current Plan</div>
                            <div className="text-2xl font-bold">
                                {user?.subscription?.plan?.displayName || 'Free Trial'}
                            </div>
                            <div className="text-sm text-gray-400 mt-1">
                                {user?.subscription?.status === 'TRIAL'
                                    ? 'Trial period active'
                                    : `${user?.subscription?.billingCycle?.toLowerCase() || 'monthly'} billing`}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-400 mb-1">Credits Reset</div>
                            <div className="text-lg font-semibold">
                                {user?.credits?.nextResetAt
                                    ? new Date(user.credits.nextResetAt).toLocaleDateString()
                                    : 'N/A'}
                            </div>
                        </div>
                        <Link href="/dashboard/billing" className="btn-primary">
                            Upgrade Plan
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
