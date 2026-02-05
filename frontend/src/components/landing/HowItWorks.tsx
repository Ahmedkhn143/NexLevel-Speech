'use client';

import { motion } from 'framer-motion';
import { Mic, Wand2, Download } from 'lucide-react';

const steps = [
    {
        icon: Mic,
        title: 'Upload Voice Samples',
        description: 'Record or upload 2-5 audio samples of your voice. Just 30 seconds is enough for a high-quality clone.',
        gradient: 'from-neon-cyan to-blue-500',
        glowColor: 'rgba(0, 255, 255, 0.3)',
    },
    {
        icon: Wand2,
        title: 'AI Creates Your Clone',
        description: 'Our advanced AI analyzes your voice patterns and creates a digital twin that captures your unique vocal characteristics.',
        gradient: 'from-neon-magenta to-purple-500',
        glowColor: 'rgba(255, 0, 255, 0.3)',
    },
    {
        icon: Download,
        title: 'Generate & Download',
        description: 'Type any text and generate natural-sounding speech in your voice. Download in MP3 or WAV format.',
        gradient: 'from-neon-lime to-emerald-500',
        glowColor: 'rgba(0, 255, 0, 0.3)',
    },
];

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24 lg:py-32 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-background" />
            <div className="absolute inset-0 cyber-grid opacity-10" />
            
            <div className="container relative z-10 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
                {/* Section Header */}
                <motion.div
                    className="text-center mb-16 lg:mb-20"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <motion.span 
                        className="inline-block px-4 py-1.5 rounded-full glass border border-neon-cyan/30 text-neon-cyan text-sm font-medium mb-6"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        Simple Process
                    </motion.span>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                        How It <span className="gradient-text">Works</span>
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Create your AI voice clone in three simple steps. No technical knowledge required.
                    </p>
                </motion.div>

                {/* Steps Container */}
                <div className="relative">
                    {/* Connection Line - Desktop */}
                    <div className="hidden lg:block absolute top-32 left-[15%] right-[15%] h-px">
                        <div className="w-full h-full bg-gradient-to-r from-neon-cyan via-neon-magenta to-neon-lime opacity-30" />
                        <motion.div 
                            className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-neon-cyan to-transparent"
                            animate={{ x: ['0%', '200%', '0%'] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                        />
                    </div>

                    {/* Steps Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                className="relative"
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 }}
                            >
                                <motion.div 
                                    className="relative p-8 rounded-2xl glass border border-white/10 text-center group overflow-hidden"
                                    whileHover={{ y: -8, scale: 1.02 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                >
                                    {/* Glow effect on hover */}
                                    <div 
                                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10"
                                        style={{ background: step.glowColor }}
                                    />
                                    
                                    {/* Scan line effect */}
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none"
                                        animate={{ y: ['-100%', '100%'] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                    />

                                    {/* Step Number Badge */}
                                    <motion.div 
                                        className={`absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-r ${step.gradient} flex items-center justify-center text-black font-bold text-lg shadow-lg`}
                                        whileHover={{ scale: 1.2, rotate: 360 }}
                                        transition={{ type: 'spring', stiffness: 300 }}
                                    >
                                        {index + 1}
                                    </motion.div>

                                    {/* Icon Container */}
                                    <div className="relative mt-4 mb-6">
                                        <motion.div
                                            className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r ${step.gradient} p-0.5`}
                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                            transition={{ type: 'spring', stiffness: 300 }}
                                        >
                                            <div className="w-full h-full rounded-2xl bg-background/90 flex items-center justify-center">
                                                <step.icon className="w-10 h-10 text-foreground" />
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-xl font-bold mb-3 text-foreground">{step.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                                </motion.div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
