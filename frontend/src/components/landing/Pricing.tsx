'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Check, Sparkles } from 'lucide-react';

const plans = [
    {
        name: 'Free Trial',
        price: { monthly: 0, yearly: 0 },
        credits: '5,000',
        features: [
            '5,000 characters per month',
            '1 voice clone',
            'MP3 download',
            'Email support',
        ],
        cta: 'Start Free',
        popular: false,
    },
    {
        name: 'Starter',
        price: { monthly: 1500, yearly: 15000 },
        credits: '50,000',
        features: [
            '50,000 characters per month',
            '3 voice clones',
            'MP3 & WAV download',
            'Multilingual support',
            'Email support',
        ],
        cta: 'Get Started',
        popular: false,
    },
    {
        name: 'Creator',
        price: { monthly: 3500, yearly: 35000 },
        credits: '200,000',
        features: [
            '200,000 characters per month',
            '10 voice clones',
            'All audio formats',
            'Multilingual support',
            'Priority support',
            'API access',
        ],
        cta: 'Get Started',
        popular: true,
    },
    {
        name: 'Professional',
        price: { monthly: 8000, yearly: 80000 },
        credits: '500,000',
        features: [
            '500,000 characters per month',
            'Unlimited voice clones',
            'All audio formats',
            'Multilingual support',
            'Dedicated support',
            'API access',
            'Commercial license',
            'Priority processing',
        ],
        cta: 'Contact Sales',
        popular: false,
    },
];

export default function Pricing() {
    const [isYearly, setIsYearly] = useState(false);

    return (
        <section id="pricing" className="py-24 relative bg-gray-950 z-10">
            <div className="container">
                {/* Section Header */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        Simple, Transparent <span className="gradient-text">Pricing</span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
                        Choose the plan that fits your needs. All prices in Pakistani Rupees (PKR).
                    </p>

                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center gap-4">
                        <span className={`text-sm ${!isYearly ? 'text-white' : 'text-gray-500'}`}>
                            Monthly
                        </span>
                        <button
                            onClick={() => setIsYearly(!isYearly)}
                            className="relative w-14 h-7 rounded-full bg-gray-700 transition-colors"
                            style={{
                                background: isYearly
                                    ? 'linear-gradient(135deg, hsl(220, 80%, 55%) 0%, hsl(270, 70%, 60%) 100%)'
                                    : undefined,
                            }}
                        >
                            <motion.div
                                className="absolute top-1 w-5 h-5 rounded-full bg-white"
                                animate={{ left: isYearly ? '32px' : '4px' }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                        </button>
                        <span className={`text-sm ${isYearly ? 'text-white' : 'text-gray-500'}`}>
                            Yearly
                            <span className="ml-2 text-xs text-green-400 font-medium">Save 17%</span>
                        </span>
                    </div>
                </motion.div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.name}
                            className={`card relative flex flex-col h-full ${plan.popular
                                ? 'border-2 border-purple-500 shadow-lg shadow-purple-500/20'
                                : 'border border-gray-800'
                                }`}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            {/* Popular Badge */}
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-xs font-semibold flex items-center gap-1 shadow-lg z-10 whitespace-nowrap">
                                    <Sparkles className="w-3 h-3" />
                                    Most Popular
                                </div>
                            )}

                            <div className="flex-1">
                                <div className="text-center mb-6 pt-4">
                                    <h3 className="text-xl font-semibold mb-2 text-white">{plan.name}</h3>
                                    <div className="flex items-baseline justify-center gap-1 text-white">
                                        <span className="text-sm text-gray-400">PKR</span>
                                        <span className="text-4xl font-bold">
                                            {isYearly
                                                ? (plan.price.yearly / 12).toLocaleString()
                                                : plan.price.monthly.toLocaleString()}
                                        </span>
                                        <span className="text-gray-400">/mo</span>
                                    </div>
                                    {isYearly && plan.price.yearly > 0 && (
                                        <p className="text-xs text-green-400 mt-1 font-medium">
                                            Billed PKR {plan.price.yearly.toLocaleString()}/year
                                        </p>
                                    )}
                                    <p className="text-sm text-gray-400 mt-2">
                                        {plan.credits} characters/month
                                    </p>
                                </div>

                                {/* Features */}
                                <ul className="space-y-3 mb-8 px-2">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                                            <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Check className="w-3 h-3 text-green-500" />
                                            </div>
                                            <span className="leading-snug">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* CTA */}
                            <div className="mt-auto pt-4">
                                <Link
                                    href="/signup"
                                    className={`w-full block text-center py-3 rounded-xl font-semibold transition-all duration-300 ${plan.popular
                                        ? 'btn-primary shadow-lg shadow-primary/25 hover:shadow-primary/40'
                                        : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
                                        }`}
                                >
                                    {plan.cta}
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
