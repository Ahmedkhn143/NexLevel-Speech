'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Loader2, Check } from 'lucide-react';
import { userApi } from '@/lib/api';
import { useAuthStore } from '@/stores';

export default function SettingsPage() {
    const { user, setUser } = useAuthStore();
    const [name, setName] = useState(user?.name || '');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [notifications, setNotifications] = useState({
        emailUpdates: true,
        usageAlerts: true,
        marketing: false,
    });

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const { data } = await userApi.updateProfile({ name });
            setUser({ ...user!, name: data.name });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error('Failed to update profile:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold mb-2">Settings</h1>
                <p className="text-gray-400">Manage your account preferences</p>
            </motion.div>

            {/* Profile Settings */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card mb-6"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-lg font-semibold">Profile</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <input
                            type="email"
                            value={user?.email || ''}
                            disabled
                            className="input opacity-50 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Display Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                            className="input"
                        />
                    </div>

                    <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="btn-primary"
                    >
                        {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : saved ? (
                            <>
                                <Check className="w-4 h-4" />
                                Saved!
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </button>
                </div>
            </motion.div>

            {/* Notification Settings */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card mb-6"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                        <Bell className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-lg font-semibold">Notifications</h2>
                </div>

                <div className="space-y-4">
                    {[
                        { key: 'emailUpdates', label: 'Email updates', description: 'Receive updates about your account' },
                        { key: 'usageAlerts', label: 'Usage alerts', description: 'Get notified when credits are running low' },
                        { key: 'marketing', label: 'Marketing emails', description: 'Receive tips, news, and offers' },
                    ].map((item) => (
                        <label
                            key={item.key}
                            className="flex items-center justify-between cursor-pointer"
                        >
                            <div>
                                <div className="font-medium">{item.label}</div>
                                <div className="text-sm text-gray-400">{item.description}</div>
                            </div>
                            <button
                                onClick={() =>
                                    setNotifications({
                                        ...notifications,
                                        [item.key]: !notifications[item.key as keyof typeof notifications],
                                    })
                                }
                                className={`relative w-12 h-6 rounded-full transition-colors ${notifications[item.key as keyof typeof notifications]
                                        ? 'bg-blue-500'
                                        : 'bg-gray-700'
                                    }`}
                            >
                                <motion.div
                                    className="absolute top-1 w-4 h-4 rounded-full bg-white"
                                    animate={{
                                        left: notifications[item.key as keyof typeof notifications]
                                            ? '28px'
                                            : '4px',
                                    }}
                                />
                            </button>
                        </label>
                    ))}
                </div>
            </motion.div>

            {/* Security */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-lg font-semibold">Security</h2>
                </div>

                <div className="space-y-4">
                    <button className="btn-secondary w-full justify-start">
                        Change Password
                    </button>
                    <button className="btn-secondary w-full justify-start text-red-400 border-red-500/30 hover:bg-red-500/10">
                        Delete Account
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
