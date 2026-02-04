'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'lucide-react';
import { useAuthStore } from '@/stores'; // Assuming this exists based on previous audit

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/app/dashboard' },
    { icon: Mic, label: 'My Voices', href: '/app/voices' },
    { icon: MessageSquare, label: 'Text to Speech', href: '/app/tts' },
    { icon: BarChart3, label: 'History', href: '/app/history' },
    { icon: CreditCard, label: 'Billing', href: '/app/billing' },
    { icon: Settings, label: 'Settings', href: '/app/settings' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAuthenticated, logout, isLoading } = useAuthStore();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Auth Guard
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
            // Or /auth/login if that's the structure
        }
    }, [isAuthenticated, isLoading, router]);

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    // Calculate Credits Percentage
    const totalCredits = user?.credits?.totalCredits || 1;
    const usedCredits = user?.credits?.usedCredits || 0;
    const availableCredits = totalCredits - usedCredits + (user?.credits?.bonusCredits || 0);
    const percentage = Math.min(100, Math.max(0, (availableCredits / totalCredits) * 100));

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) return null; // Prevent flash

    return (
        <div className="min-h-screen flex bg-background text-foreground overflow-hidden">
            {/* Desktop Sidebar */}
            <aside
                className={`hidden lg:flex flex-col fixed left-0 top-0 h-full bg-card border-r border-border transition-all duration-300 z-40 ${isSidebarOpen ? 'w-72' : 'w-20'}`}
            >
                {/* Logo */}
                <div className="p-6 flex items-center gap-3 border-b border-border">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0">
                        <Mic className="w-6 h-6 text-white" />
                    </div>
                    {isSidebarOpen && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-xl font-bold tracking-tight"
                        >
                            Nex<span className="gradient-text">Level</span>
                        </motion.span>
                    )}
                </div>

                {/* Nav Items */}
                <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                        ? 'bg-primary/10 text-primary font-medium shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                    }`}
                                title={!isSidebarOpen ? item.label : ''}
                            >
                                <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-primary' : 'group-hover:text-foreground'}`} />
                                {isSidebarOpen && (
                                    <span className="truncate">{item.label}</span>
                                )}
                                {isActive && isSidebarOpen && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Credits Widget */}
                {isSidebarOpen ? (
                    <div className="p-4 mx-4 mb-4 rounded-2xl bg-muted/30 border border-border">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Credits</span>
                            <span className="text-xs font-bold text-primary">{availableCredits.toLocaleString()}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-primary to-accent"
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            />
                        </div>
                        <p className="text-[10px] text-gray-500 mt-2 text-right">
                            Resets {user?.subscription?.currentPeriodEnd ? new Date(user.subscription.currentPeriodEnd).toLocaleDateString() : 'Monthly'}
                        </p>
                    </div>
                ) : (
                    <div className="p-4 flex justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" title="Credits Available" />
                    </div>
                )}

                {/* User Profile */}
                <div className="p-4 border-t border-border">
                    <button
                        onClick={handleLogout}
                        className={`flex items-center gap-3 w-full p-2 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-colors group ${!isSidebarOpen ? 'justify-center' : ''}`}
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        {isSidebarOpen && <span className="text-sm font-medium">Sign Out</span>}
                    </button>

                    {isSidebarOpen && (
                        <div className="flex items-center gap-3 mt-4 px-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center border border-gray-700">
                                <span className="text-xs font-bold text-white">
                                    {user?.name?.[0] || 'U'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
                                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 z-50">
                <Link href="/app/dashboard" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                        <Mic className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-bold">NexLevel</span>
                </Link>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-foreground hover:bg-muted rounded-lg"
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </header>

            {/* Main Content Area */}
            <main
                className={`flex-1 transition-all duration-300 pt-16 lg:pt-0 ${isSidebarOpen ? 'lg:ml-72' : 'lg:ml-20'
                    }`}
            >
                <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="w-full"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: -300 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -300 }}
                        className="lg:hidden fixed inset-0 z-50 bg-background"
                    >
                        <div className="p-4 flex flex-col h-full">
                            <div className="flex justify-between items-center mb-8">
                                <span className="text-xl font-bold">Menu</span>
                                <button onClick={() => setIsMobileMenuOpen(false)}>
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <nav className="space-y-2 flex-1">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-4 rounded-xl text-lg ${pathname === item.href
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-muted-foreground'
                                            }`}
                                    >
                                        <item.icon className="w-6 h-6" />
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
