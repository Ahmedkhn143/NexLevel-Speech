'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CTA() {
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-primary/20" />

            {/* Animated Shapes */}
            <motion.div
                className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px]"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 10, repeat: Infinity }}
            />
            <motion.div
                className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]"
                animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 10, repeat: Infinity, delay: 5 }}
            />

            <div className="container relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-3xl mx-auto"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 border border-white/10">
                        <Sparkles className="w-4 h-4 text-yellow-500" />
                        <span className="text-gray-200 text-sm">Join 10,000+ Creators</span>
                    </div>

                    <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">
                        Ready to find your <br />
                        <span className="gradient-text">Next Level Voice?</span>
                    </h2>

                    <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                        Start clonning today. No credit card required for standard quality generations.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/signup" className="btn-primary text-lg px-10 py-5 shadow-2xl shadow-primary/30 hover:shadow-primary/50">
                            Start Creating for Free <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>
                        <Link href="#pricing" className="btn-secondary text-lg px-10 py-5 bg-black/40 backdrop-blur-md border border-white/10 hover:bg-white/5">
                            View Enterprise Plans
                        </Link>
                    </div>

                    <p className="mt-8 text-sm text-gray-500">
                        Includes 5,000 free characters • No credit card required
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
