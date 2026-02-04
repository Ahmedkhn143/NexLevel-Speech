'use client';

import { useAuthStore } from '@/stores';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LogOut, Trash2, Shield, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
    const { user, logout } = useAuthStore();

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success("Password updated successfully");
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold">Settings</h1>

            {/* Profile Section */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <User className="w-5 h-5" /> Profile
                </h2>
                <Card>
                    <div className="flex items-center gap-6 mb-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-xl">
                            {user?.name?.[0] || 'U'}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">{user?.name}</h3>
                            <p className="text-muted-foreground">{user?.email}</p>
                            <p className="text-xs text-primary mt-1 uppercase font-semibold tracking-wider">
                                {user?.subscription?.planId || 'Free Tier'}
                            </p>
                        </div>
                    </div>
                </Card>
            </section>

            {/* Security Section */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Shield className="w-5 h-5" /> Security
                </h2>
                <Card>
                    <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                        <Input label="New Password" type="password" placeholder="••••••••" />
                        <Input label="Confirm New Password" type="password" placeholder="••••••••" />
                        <Button type="submit" variant="secondary">Update Password</Button>
                    </form>
                </Card>
            </section>

            {/* Danger Zone */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-red-500 flex items-center gap-2">
                    <Trash2 className="w-5 h-5" /> Danger Zone
                </h2>
                <Card className="border-red-500/20 bg-red-500/5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-red-500">Delete Account</h3>
                            <p className="text-sm text-muted-foreground">
                                Permanently remove your account and all data.
                            </p>
                        </div>
                        <Button variant="danger">Delete Account</Button>
                    </div>
                </Card>
            </section>

            <div className="pt-8">
                <Button onClick={logout} variant="ghost" className="text-muted-foreground hover:text-foreground">
                    <LogOut className="w-4 h-4 mr-2" />
                    Log out of all devices
                </Button>
            </div>
        </div>
    );
}
