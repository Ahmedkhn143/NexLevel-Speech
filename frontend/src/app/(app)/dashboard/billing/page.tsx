'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Star, CreditCard, ArrowRight } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageHeader } from '@/components/shared';
import { paymentApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface Plan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  monthlyPricePKR: number;
  creditsPerMonth: number;
  maxVoiceClones: number;
  features: string[];
  isFree: boolean;
}

export default function BillingPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data } = await paymentApi.getPlans();
        // Parse features if they're JSON strings
        const parsed = (data || []).map((plan: any) => ({
          ...plan,
          features: typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features,
        }));
        setPlans(parsed);
      } catch (err) {
        console.error('Failed to fetch plans:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const currentPlan = user?.subscription?.plan?.name || 'starter';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Calculate credits
  const totalCredits = user?.credits?.totalCredits || 0;
  const usedCredits = user?.credits?.usedCredits || 0;
  const bonusCredits = user?.credits?.bonusCredits || 0;
  const availableCredits = totalCredits - usedCredits + bonusCredits;
  const usagePercentage = totalCredits > 0 ? Math.round((usedCredits / totalCredits) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing & Plans"
        description="Manage your subscription and credits"
      />

      {/* Current Usage */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-1">Current Usage</h3>
            <p className="text-sm text-muted-foreground">
              Your credit usage for this billing period
            </p>
          </div>
          
          <div className="flex items-center gap-8">
            <div>
              <p className="text-3xl font-bold text-primary">{availableCredits.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Credits remaining</p>
            </div>
            <div className="w-32">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Used</span>
                <span className="font-medium">{usagePercentage}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-accent"
                  initial={{ width: 0 }}
                  animate={{ width: `${usagePercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Billing Cycle Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center p-1 bg-muted rounded-xl">
          <button
            onClick={() => setBillingCycle('MONTHLY')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              billingCycle === 'MONTHLY'
                ? 'bg-card text-foreground shadow'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('YEARLY')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              billingCycle === 'YEARLY'
                ? 'bg-card text-foreground shadow'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Yearly <span className="text-green-400 ml-1">-20%</span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 space-y-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-10 w-32" />
              <div className="space-y-2">
                {[1, 2, 3, 4].map((j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </div>
              <Skeleton className="h-10 w-full" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, index) => {
            const isCurrentPlan = plan.name === currentPlan;
            const isPopular = plan.name === 'creator';
            const price = billingCycle === 'YEARLY' 
              ? Math.round(plan.monthlyPricePKR * 12 * 0.8) 
              : plan.monthlyPricePKR;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`p-6 relative ${
                    isPopular ? 'border-primary ring-1 ring-primary' : ''
                  } ${isCurrentPlan ? 'bg-primary/5' : ''}`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-4">
                    <h3 className="text-xl font-bold">{plan.displayName}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {plan.description}
                    </p>
                  </div>

                  <div className="mb-6">
                    {plan.isFree ? (
                      <p className="text-3xl font-bold">Free</p>
                    ) : (
                      <>
                        <p className="text-3xl font-bold">
                          {formatPrice(price)}
                          <span className="text-base font-normal text-muted-foreground">
                            /{billingCycle === 'YEARLY' ? 'year' : 'mo'}
                          </span>
                        </p>
                      </>
                    )}
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm">
                      <Zap className="w-4 h-4 text-primary" />
                      <span>{plan.creditsPerMonth.toLocaleString()} credits/month</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="w-4 h-4 text-primary" />
                      <span>{plan.maxVoiceClones} voice clones</span>
                    </div>
                    {plan.features?.map((feature: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-400" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {isCurrentPlan ? (
                    <Button variant="secondary" className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      variant={isPopular ? 'primary' : 'secondary'}
                      className="w-full"
                      onClick={() => toast.success('Upgrade flow coming soon!')}
                    >
                      {plan.isFree ? 'Downgrade' : 'Upgrade'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
