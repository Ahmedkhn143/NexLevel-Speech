'use client';

import { motion } from 'framer-motion';
import { Youtube, Radio, Headphones, Building, Accessibility, Globe } from 'lucide-react';

const useCases = [
    {
        icon: Youtube,
        title: 'Content Creators',
        description: 'Create voiceovers for YouTube videos, podcasts, and social media content in multiple languages.',
        gradient: 'from-red-500 to-orange-500',
        glowColor: 'rgba(239, 68, 68, 0.3)',
    },
    {
        icon: Radio,
        title: 'Advertisers',
        description: 'Produce professional ad voiceovers at scale without expensive studio sessions.',
        gradient: 'from-neon-cyan to-blue-500',
        glowColor: 'rgba(0, 255, 255, 0.3)',
    },
    {
        icon: Headphones,
        title: 'Audiobook Publishers',
        description: 'Transform written content into engaging audiobooks with natural-sounding narration.',
        gradient: 'from-neon-magenta to-purple-500',
        glowColor: 'rgba(255, 0, 255, 0.3)',
    },
    {
        icon: Building,
        title: 'Call Centers',
        description: 'Create consistent, professional IVR prompts and automated responses.',
        gradient: 'from-neon-lime to-emerald-500',
        glowColor: 'rgba(0, 255, 0, 0.3)',
    },
    {
        icon: Accessibility,
        title: 'Accessibility',
        description: 'Make content accessible with text-to-speech for visually impaired users.',
        gradient: 'from-orange-500 to-yellow-500',
        glowColor: 'rgba(249, 115, 22, 0.3)',
    },
    {
        icon: Globe,
        title: 'Localization',
        description: 'Localize content into 29+ languages while maintaining your unique voice.',
        gradient: 'from-cyan-500 to-teal-500',
        glowColor: 'rgba(6, 182, 212, 0.3)',
    },
];

export default function UseCases() {
    return (
        <section id="use-cases" className="py-24 lg:py-32 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
            <div className="absolute inset-0 gradient-mesh opacity-20" />
            
            <div className="container relative z-10 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
                {/* Section Header */}
                <motion.div
                    className="text-center mb-16 lg:mb-20"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <motion.span 
                        className="inline-block px-4 py-1.5 rounded-full glass border border-neon-magenta/30 text-neon-magenta text-sm font-medium mb-6"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        Use Cases
                    </motion.span>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                        Built for <span className="gradient-text">Every Use Case</span>
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        From content creators to enterprises, NexLevel Speech powers voice for millions.
                    </p>
                </motion.div>

                {/* Use Cases Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {useCases.map((useCase, index) => (
                        <motion.div
                            key={useCase.title}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <motion.div 
                                className="relative h-full p-6 lg:p-8 rounded-2xl glass border border-white/10 group cursor-pointer overflow-hidden"
                                whileHover={{ y: -8, scale: 1.02 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            >
                                {/* Glow effect on hover */}
                                <div 
                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10"
                                    style={{ background: useCase.glowColor }}
                                />
                                
                                {/* Scan line effect */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none"
                                    animate={{ y: ['-100%', '100%'] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                />

                                {/* Icon */}
                                <motion.div
                                    className={`relative w-14 h-14 rounded-xl bg-gradient-to-r ${useCase.gradient} flex items-center justify-center mb-5`}
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                >
                                    <useCase.icon className="w-7 h-7 text-white" />
                                </motion.div>

                                {/* Content */}
                                <h3 className="relative text-xl font-bold mb-3 text-foreground group-hover:text-white transition-colors">
                                    {useCase.title}
                                </h3>
                                <p className="relative text-muted-foreground leading-relaxed group-hover:text-white/70 transition-colors">
                                    {useCase.description}
                                </p>

                                {/* Bottom gradient line on hover */}
                                <motion.div 
                                    className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${useCase.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}
                                />
                            </motion.div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
