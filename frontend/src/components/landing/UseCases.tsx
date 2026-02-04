'use client';

import { motion } from 'framer-motion';
import { Youtube, Radio, Headphones, Building, Accessibility, Globe } from 'lucide-react';

const useCases = [
    {
        icon: Youtube,
        title: 'Content Creators',
        description: 'Create voiceovers for YouTube videos, podcasts, and social media content in multiple languages.',
        color: 'bg-red-500',
    },
    {
        icon: Radio,
        title: 'Advertisers',
        description: 'Produce professional ad voiceovers at scale without expensive studio sessions.',
        color: 'bg-blue-500',
    },
    {
        icon: Headphones,
        title: 'Audiobook Publishers',
        description: 'Transform written content into engaging audiobooks with natural-sounding narration.',
        color: 'bg-purple-500',
    },
    {
        icon: Building,
        title: 'Call Centers',
        description: 'Create consistent, professional IVR prompts and automated responses.',
        color: 'bg-green-500',
    },
    {
        icon: Accessibility,
        title: 'Accessibility',
        description: 'Make content accessible with text-to-speech for visually impaired users.',
        color: 'bg-orange-500',
    },
    {
        icon: Globe,
        title: 'Localization',
        description: 'Localize content into 29+ languages while maintaining your unique voice.',
        color: 'bg-cyan-500',
    },
];

export default function UseCases() {
    return (
        <section id="use-cases" className="py-24 bg-gray-900/50">
            <div className="container">
                {/* Section Header */}
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        Built for <span className="gradient-text">Every Use Case</span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        From content creators to enterprises, NexLevel Speech powers voice for millions.
                    </p>
                </motion.div>

                {/* Use Cases Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {useCases.map((useCase, index) => (
                        <motion.div
                            key={useCase.title}
                            className="card group cursor-pointer"
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                        >
                            <div
                                className={`w-12 h-12 rounded-xl ${useCase.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                            >
                                <useCase.icon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">{useCase.title}</h3>
                            <p className="text-gray-400">{useCase.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
