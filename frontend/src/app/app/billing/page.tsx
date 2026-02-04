'use client';

import { Check, Zap, Star } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const PLANS = [
    {
        id: 'starter',
        name: 'Starter',
        price: 'Free',
        credits: 1000,
        features: ['1 Voice Clone', 'Standard Support', 'Standard Quality'],
        color: 'text-gray-400',
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 'Rs 1500',
        credits: 50000,
        features: ['5 Voice Clones', 'Priority Support', 'High Quality', 'Commercial Rights'],
        color: 'text-primary',
        popular: true,
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 'Rs 5000',
        credits: 200000,
        features: ['Unlimited Clones', 'API Access', '24/7 Support', 'Custom Models'],
        color: 'text-purple-400',
    },
];

export default function BillingPage() {
    const { user } = useAuthStore();
    const currentPlanId = user?.subscription?.planId;

    const handleUpgrade = async (planId: string) => {
        try {
            // In a real app, this opens a modal to select payment provider (JazzCash/EasyPaisa)
            // For now, initiate payment with default provider or prompt
            toast('Redirecting to payment...', { icon: '💳' });

            // Example:
            // const { data } = await api.post('/payment/create', { planId, provider: 'JAZZCASH' });
            // window.location.href = data.redirectUrl; // or handle response

            // Ideally we show a Modal to pick "JazzCash" or "EasyPaisa" or "Manual".
            // Since I haven't built that modal fully yet, I'll log.
            console.log('Upgrade to', planId);
            toast.error("Payment integration requires provider selection. (Implemented in backend, frontend UI pending)");

        } catch (error) {
            toast.error('Failed to initiate upgrade');
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-10 text-center">
                <h1 className="text-3xl font-bold mb-2">Manage Subscription</h1>
                <p className="text-muted-foreground">Choose the perfect plan for your creative needs.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {PLANS.map((plan, index) => {
                    const isCurrent = currentPlanId === plan.id || (!currentPlanId && plan.id === 'starter');
                    return (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card
                                className={`h-full flex flex-col relative overflow-hidden ${plan.popular ? 'border-primary shadow-lg shadow-primary/10' : ''}`}
                                glass={plan.popular}
                            >
                                {plan.popular && (
                                    <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                                        MOST POPULAR
                                    </div>
                                )}

                                <div className="mb-6">
                                    <div className={`p-3 rounded-2xl w-fit mb-4 bg-muted/50 ${plan.color}`}>
                                        <Zap className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1 mt-2">
                                        <span className="text-3xl font-bold">{plan.price}</span>
                                        <span className="text-sm text-muted-foreground">/month</span>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8 flex-1">
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                                            <Star className="w-3 h-3 fill-current" />
                                        </div>
                                        <span>{plan.credits.toLocaleString()} Credits / mo</span>
                                    </div>
                                    {plan.features.map((feat, i) => (
                                        <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                            <span>{feat}</span>
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    variant={isCurrent ? 'secondary' : plan.popular ? 'primary' : 'secondary'}
                                    className="w-full"
                                    onClick={() => handleUpgrade(plan.id)}
                                    disabled={isCurrent}
                                >
                                    {isCurrent ? 'Current Plan' : 'Upgrade Now'}
                                </Button>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {/* Billing History Section (Placeholder) */}
            <div className="mt-12">
                <h2 className="text-xl font-bold mb-4">Billing History</h2>
                <Card className="p-0 overflow-hidden">
                    <div className="p-8 text-center text-muted-foreground">
                        <p>No payment history available.</p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
