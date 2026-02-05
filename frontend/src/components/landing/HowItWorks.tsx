'use client';

import { motion } from 'framer-motion';
import { Mic, Wand2, Download } from 'lucide-react';

const steps = [
    {
        icon: Mic,
        title: 'Upload Voice Samples',
        description: 'Record or upload 2-5 audio samples of your voice. Just 30 seconds is enough for a high-quality clone.',
        color: 'from-blue-500 to-cyan-500',
    },
    {
        icon: Wand2,
        title: 'AI Creates Your Clone',
        description: 'Our advanced AI analyzes your voice patterns and creates a digital twin that captures your unique vocal characteristics.',
        color: 'from-purple-500 to-pink-500',
    },
    {
        icon: Download,
        title: 'Generate & Download',
        description: 'Type any text and generate natural-sounding speech in your voice. Download in MP3 or WAV format.',
        color: 'from-orange-500 to-red-500',
    },
];

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24 relative bg-gray-950 z-10">
            <div className="container">
                {/* Section Header */}
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        How It <span className="gradient-text">Works</span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Create your AI voice clone in three simple steps. No technical knowledge required.
                    </p>
                </motion.div>

                {/* Steps */}
                <div className="grid-features relative">
                    {/* Connection Line */}
                    <div className="absolute top-24 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 hidden md:block opacity-30" />

                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            className="relative"
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                        >
                            <div className="card text-center group">
                                {/* Step Number */}
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                    {index + 1}
                                </div>

                                {/* Icon */}
                                <div
                                    className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${step.color} p-0.5 mx-auto mb-6 mt-4 group-hover:scale-110 transition-transform duration-300`}
                                >
                                    <div className="w-full h-full rounded-2xl bg-gray-900 flex items-center justify-center">
                                        <step.icon className="w-10 h-10 text-white" />
                                    </div>
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                                <p className="text-gray-400">{step.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
