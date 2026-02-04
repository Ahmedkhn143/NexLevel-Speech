'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, CreditCard, Loader2 } from 'lucide-react';
import { paymentApi } from '@/lib/api';
import { Plan } from '@/types';
import { useAuthStore } from '@/stores';

export default function BillingPage() {
    const { user } = useAuthStore();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [isYearly, setIsYearly] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [paymentProvider, setPaymentProvider] = useState<'JAZZCASH' | 'EASYPAISA'>('JAZZCASH');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        try {
            const { data } = await paymentApi.getPlans();
            setPlans(data);
        } catch (error) {
            console.error('Failed to load plans:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async (planId: string) => {
        setProcessing(true);
        try {
            const { data } = await paymentApi.createPayment({
                planId,
                billingCycle: isYearly ? 'YEARLY' : 'MONTHLY',
                provider: paymentProvider,
            });

            // Redirect to payment gateway
            if (data.redirectUrl) {
                window.location.href = data.redirectUrl;
            } else if (data.formAction && data.formData) {
                // For JazzCash form-based redirect
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = data.formAction;

                Object.entries(data.formData).forEach(([key, value]) => {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = value as string;
                    form.appendChild(input);
                });

                document.body.appendChild(form);
                form.submit();
            }
        } catch (error) {
            console.error('Failed to create payment:', error);
        } finally {
            setProcessing(false);
        }
    };

    const currentPlanId = user?.subscription?.planId;

    return (
        <div className="max-w-5xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold mb-2">Billing & Plans</h1>
                <p className="text-gray-400">
                    Manage your subscription and payment methods
                </p>
            </motion.div>

            {/* Current Plan */}
            {user?.subscription && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="card mb-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-400 mb-1">Current Plan</div>
                            <div className="text-2xl font-bold">
                                {user.subscription.plan?.displayName || 'Free Trial'}
                            </div>
                            <div className="text-sm text-gray-400 mt-1">
                                {user.subscription.status === 'ACTIVE' ? 'Active' : user.subscription.status} •{' '}
                                {user.subscription.billingCycle?.toLowerCase()} billing
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-400">Next billing</div>
                            <div className="font-semibold">
                                {new Date(user.subscription.currentPeriodEnd).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Billing Toggle */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-center gap-4 mb-8"
            >
                <span className={!isYearly ? 'text-white' : 'text-gray-500'}>Monthly</span>
                <button
                    onClick={() => setIsYearly(!isYearly)}
                    className="relative w-14 h-7 rounded-full transition-colors"
                    style={{
                        background: isYearly
                            ? 'linear-gradient(135deg, hsl(220, 80%, 55%) 0%, hsl(270, 70%, 60%) 100%)'
                            : '#374151',
                    }}
                >
                    <motion.div
                        className="absolute top-1 w-5 h-5 rounded-full bg-white"
                        animate={{ left: isYearly ? '32px' : '4px' }}
                    />
                </button>
                <span className={isYearly ? 'text-white' : 'text-gray-500'}>
                    Yearly <span className="text-green-400 text-sm">Save 17%</span>
                </span>
            </motion.div>

            {/* Payment Provider Selection */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="flex items-center justify-center gap-4 mb-8"
            >
                <span className="text-sm text-gray-400">Pay with:</span>
                <button
                    onClick={() => setPaymentProvider('JAZZCASH')}
                    className={`px-4 py-2 rounded-lg border transition-colors ${paymentProvider === 'JAZZCASH'
                            ? 'border-green-500 bg-green-500/10 text-green-400'
                            : 'border-gray-700 text-gray-400 hover:border-gray-600'
                        }`}
                >
                    JazzCash
                </button>
                <button
                    onClick={() => setPaymentProvider('EASYPAISA')}
                    className={`px-4 py-2 rounded-lg border transition-colors ${paymentProvider === 'EASYPAISA'
                            ? 'border-green-500 bg-green-500/10 text-green-400'
                            : 'border-gray-700 text-gray-400 hover:border-gray-600'
                        }`}
                >
                    EasyPaisa
                </button>
            </motion.div>

            {/* Plans Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {plans.map((plan, index) => {
                        const isCurrentPlan = plan.id === currentPlanId;
                        const price = isYearly ? plan.yearlyPricePKR / 12 : plan.monthlyPricePKR;

                        return (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + index * 0.1 }}
                                className={`card relative ${plan.name === 'creator'
                                        ? 'border-2 border-purple-500'
                                        : ''
                                    }`}
                            >
                                {plan.name === 'creator' && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-xs font-semibold flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" />
                                        Popular
                                    </div>
                                )}

                                <div className="text-center mb-4">
                                    <h3 className="text-lg font-semibold">{plan.displayName}</h3>
                                    <div className="flex items-baseline justify-center gap-1 mt-2">
                                        <span className="text-sm text-gray-500">PKR</span>
                                        <span className="text-3xl font-bold">{price.toLocaleString()}</span>
                                        <span className="text-gray-500">/mo</span>
                                    </div>
                                    <p className="text-sm text-gray-400 mt-1">
                                        {(plan.creditsPerMonth / 1000).toFixed(0)}K chars/month
                                    </p>
                                </div>

                                <ul className="space-y-2 mb-6 text-sm">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-2 text-gray-300">
                                            <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => !isCurrentPlan && handleSubscribe(plan.id)}
                                    disabled={isCurrentPlan || processing || plan.isFree}
                                    className={`w-full py-3 rounded-xl font-semibold transition-colors ${isCurrentPlan
                                            ? 'bg-green-500/20 text-green-400 cursor-default'
                                            : plan.isFree
                                                ? 'bg-gray-800 text-gray-400 cursor-not-allowed'
                                                : 'btn-primary'
                                        }`}
                                >
                                    {isCurrentPlan ? 'Current Plan' : plan.isFree ? 'Current' : 'Upgrade'}
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
