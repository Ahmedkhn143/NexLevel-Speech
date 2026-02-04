'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Mic,
    MessageSquare,
    CreditCard,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronDown,
} from 'lucide-react';
import { useAuthStore } from '@/stores';

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Mic, label: 'My Voices', href: '/dashboard/voices' },
    { icon: MessageSquare, label: 'Generate', href: '/dashboard/generate' },
    { icon: BarChart3, label: 'Usage', href: '/dashboard/usage' },
    { icon: CreditCard, label: 'Billing', href: '/dashboard/billing' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAuthenticated, logout, isLoading } = useAuthStore();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, router]);

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    if (isLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const availableCredits = user?.credits
        ? user.credits.totalCredits - user.credits.usedCredits + user.credits.bonusCredits
        : 0;

    return (
        <div className="min-h-screen flex">
            {/* Sidebar - Desktop */}
            <aside
                className={`hidden lg:flex flex-col fixed left-0 top-0 h-full bg-gray-900 border-r border-gray-800 transition-all duration-300 z-40 ${isSidebarOpen ? 'w-64' : 'w-20'
                    }`}
            >
                {/* Logo */}
                <div className="p-4 border-b border-gray-800">
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                        </div>
                        {isSidebarOpen && (
                            <span className="text-lg font-bold">
                                Nex<span className="gradient-text">Level</span>
                            </span>
                        )}
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-colors ${isActive
                                        ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                    }`}
                            >
                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                {isSidebarOpen && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Credits Display */}
                {isSidebarOpen && (
                    <div className="p-4 mx-2 mb-2 rounded-xl bg-gray-800">
                        <div className="text-xs text-gray-400 mb-1">Credits Available</div>
                        <div className="text-xl font-bold gradient-text">
                            {availableCredits.toLocaleString()}
                        </div>
                        <div className="w-full h-2 bg-gray-700 rounded-full mt-2 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                                style={{
                                    width: `${Math.min(
                                        100,
                                        ((user?.credits?.totalCredits || 0) - (user?.credits?.usedCredits || 0)) /
                                        (user?.credits?.totalCredits || 1) *
                                        100
                                    )}%`,
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* User & Logout */}
                <div className="p-4 border-t border-gray-800">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                            {user?.avatarUrl ? (
                                <img
                                    src={user.avatarUrl}
                                    alt={user.name || 'User'}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <span className="text-white font-semibold">
                                    {user?.name?.[0] || user?.email?.[0] || 'U'}
                                </span>
                            )}
                        </div>
                        {isSidebarOpen && (
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">{user?.name || 'User'}</div>
                                <div className="text-xs text-gray-500 truncate">{user?.email}</div>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 w-full rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        {isSidebarOpen && <span>Log out</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 z-50">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                    </div>
                    <span className="text-lg font-bold">NexLevel</span>
                </Link>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </header>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <motion.div
                    className="lg:hidden fixed inset-0 bg-gray-900 z-40 pt-16"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <nav className="p-4 space-y-2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive
                                            ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white'
                                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                        <hr className="border-gray-800 my-4" />
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-400 hover:text-white hover:bg-gray-800"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Log out</span>
                        </button>
                    </nav>
                </motion.div>
            )}

            {/* Main Content */}
            <main
                className={`flex-1 transition-all duration-300 pt-16 lg:pt-0 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
                    }`}
            >
                <div className="p-6">{children}</div>
            </main>
        </div>
    );
}
