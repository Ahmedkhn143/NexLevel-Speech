'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, Zap, Globe, Shield } from 'lucide-react';

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Animated Gradient Mesh */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-gray-950 to-gray-950" />
                
                {/* Floating Orbs */}
                <motion.div
                    className="absolute w-[800px] h-[800px] rounded-full blur-3xl"
                    style={{
                        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
                        top: '-300px',
                        left: '-200px',
                    }}
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
                <motion.div
                    className="absolute w-[600px] h-[600px] rounded-full blur-3xl"
                    style={{
                        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
                        bottom: '-200px',
                        right: '-100px',
                    }}
                    animate={{
                        scale: [1.1, 1, 1.1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 2,
                    }}
                />
                
                {/* Grid Pattern */}
                <div 
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                          linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: '64px 64px'
                    }}
                />

                {/* Sound Wave Animation */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <WaveAnimation />
                </div>
            </div>

            <div className="container relative z-10">
                <motion.div
                    className="text-center max-w-5xl mx-auto"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                >
                    {/* Badge */}
                    <motion.div
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 mb-8"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Sparkles className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Next-Gen AI Voice Technology
                        </span>
                    </motion.div>

                    {/* Main Heading */}
                    <motion.h1
                        className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-[1.1] tracking-tight"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <span className="text-white">Clone Your Voice.</span>
                        <br />
                        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Speak Any Language.
                        </span>
                    </motion.h1>

                    {/* Description */}
                    <motion.p
                        className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        Create ultra-realistic AI voice clones from just a few samples.
                        Generate natural-sounding speech in <span className="text-white font-medium">29+ languages</span> for 
                        content creation, accessibility, and beyond.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Link 
                            href="/signup" 
                            className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl font-semibold text-white text-lg shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-1 flex items-center gap-2"
                        >
                            Get Started Free
                            <svg
                                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                                />
                            </svg>
                        </Link>
                        <a 
                            href="#demo" 
                            className="group px-8 py-4 bg-white/5 backdrop-blur border border-white/10 rounded-2xl font-semibold text-white text-lg hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
                        >
                            <svg
                                className="w-5 h-5 text-blue-400"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M8 5v14l11-7z" />
                            </svg>
                            Try Live Demo
                        </a>
                    </motion.div>

                    {/* Feature Pills */}
                    <motion.div
                        className="flex flex-wrap items-center justify-center gap-4 mb-16"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        {[
                            { icon: Zap, text: 'Instant Generation' },
                            { icon: Globe, text: '29+ Languages' },
                            { icon: Shield, text: 'Enterprise Security' },
                        ].map((item, i) => (
                            <div 
                                key={i} 
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10"
                            >
                                <item.icon className="w-4 h-4 text-blue-400" />
                                <span className="text-sm text-gray-300">{item.text}</span>
                            </div>
                        ))}
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        className="grid grid-cols-3 gap-8 max-w-2xl mx-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                    >
                        {[
                            { value: '29+', label: 'Languages Supported' },
                            { value: '10M+', label: 'Characters Generated' },
                            { value: '99.9%', label: 'Uptime SLA' },
                        ].map((stat, i) => (
                            <div key={i} className="text-center">
                                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-1">
                                    {stat.value}
                                </div>
                                <div className="text-xs md:text-sm text-gray-500 uppercase tracking-wider">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                <div className="w-6 h-10 rounded-full border-2 border-gray-600 flex items-start justify-center p-2">
                    <motion.div 
                        className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                        animate={{ y: [0, 12, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                </div>
            </motion.div>
        </section>
    );
}

function WaveAnimation() {
    return (
        <svg
            className="w-full max-w-3xl"
            viewBox="0 0 800 200"
            fill="none"
        >
            {[...Array(5)].map((_, i) => (
                <motion.path
                    key={i}
                    d={`M0 100 Q200 ${50 + i * 10} 400 100 T800 100`}
                    stroke={`url(#gradient${i})`}
                    strokeWidth={2}
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{
                        pathLength: 1,
                        opacity: [0.3, 0.8, 0.3],
                        d: [
                            `M0 100 Q200 ${50 + i * 10} 400 100 T800 100`,
                            `M0 100 Q200 ${150 - i * 10} 400 100 T800 100`,
                            `M0 100 Q200 ${50 + i * 10} 400 100 T800 100`,
                        ]
                    }}
                    transition={{
                        duration: 3 + i * 0.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: i * 0.2,
                    }}
                />
            ))}
            <defs>
                {[...Array(5)].map((_, i) => (
                    <linearGradient key={i} id={`gradient${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="hsl(220, 80%, 55%)" stopOpacity={0.5 + i * 0.1} />
                        <stop offset="50%" stopColor="hsl(270, 70%, 60%)" stopOpacity={0.7 + i * 0.05} />
                        <stop offset="100%" stopColor="hsl(220, 80%, 55%)" stopOpacity={0.5 + i * 0.1} />
                    </linearGradient>
                ))}
            </defs>
        </svg>
    );
}
