'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Check, Sparkles, Zap, Crown, ArrowRight } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: 0,
    period: 'forever',
    description: 'Perfect for trying out the platform',
    features: [
      '10,000 characters/month',
      '3 voice clones',
      'Standard quality audio',
      'API access',
      'Community support',
    ],
    cta: 'Start Free',
    popular: false,
    gradient: 'from-gray-500 to-gray-600',
  },
  {
    name: 'Pro',
    price: 29,
    period: '/month',
    description: 'For creators and professionals',
    features: [
      '100,000 characters/month',
      'Unlimited voice clones',
      'Ultra HD audio quality',
      'Priority API access',
      'Advanced voice settings',
      'Email support',
      'Commercial license',
    ],
    cta: 'Get Pro',
    popular: true,
    gradient: 'from-[#00ffff] to-[#ff00ff]',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For teams and organizations',
    features: [
      'Unlimited characters',
      'Unlimited voice clones',
      'Custom voice training',
      'Dedicated infrastructure',
      'SLA guarantee',
      '24/7 priority support',
      'Custom integrations',
      'On-premise deployment',
    ],
    cta: 'Contact Sales',
    popular: false,
    gradient: 'from-[#00ff00] to-[#00ffff]',
  },
];

// 3D Pricing Card
const PricingCard3D = ({ 
  plan, 
  index 
}: { 
  plan: typeof plans[0]; 
  index: number;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: '-50px' });
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 150, damping: 15 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 150, damping: 15 });
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };
  
  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };
  
  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50, rotateX: -10 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="perspective-container h-full"
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`relative h-full ${plan.popular ? 'z-10' : ''}`}
      >
        {/* Popular badge */}
        {plan.popular && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute -top-4 left-1/2 -translate-x-1/2 z-20"
          >
            <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-neon-cyan to-neon-magenta">
              <Crown className="w-4 h-4 text-black" />
              <span className="text-sm font-bold text-black">Most Popular</span>
            </div>
          </motion.div>
        )}
        
        {/* Glow effect for popular */}
        {plan.popular && (
          <div className="absolute -inset-[2px] bg-gradient-to-r from-neon-cyan via-neon-magenta to-neon-lime rounded-3xl blur-lg opacity-50" />
        )}
        
        {/* Card */}
        <div 
          className={`relative h-full rounded-2xl overflow-hidden ${
            plan.popular 
              ? 'bg-gradient-to-b from-surface/90 to-surface border-2 border-neon-cyan/50' 
              : 'glass border border-white/10'
          }`}
        >
          {/* Top gradient line */}
          <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${plan.gradient}`} />
          
          {/* Content */}
          <div className="p-8 h-full flex flex-col">
            {/* Plan name */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </div>
            
            {/* Price */}
            <div className="mb-8">
              <div className="flex items-baseline gap-1">
                {typeof plan.price === 'number' ? (
                  <>
                    <span className="text-sm text-muted-foreground">$</span>
                    <span className={`text-5xl font-bold ${plan.popular ? 'gradient-text' : 'text-foreground'}`}>
                      {plan.price}
                    </span>
                  </>
                ) : (
                  <span className={`text-4xl font-bold gradient-text`}>
                    {plan.price}
                  </span>
                )}
                <span className="text-muted-foreground ml-1">{plan.period}</span>
              </div>
            </div>
            
            {/* Features */}
            <ul className="space-y-4 mb-8 flex-1">
              {plan.features.map((feature, i) => (
                <motion.li
                  key={feature}
                  initial={{ opacity: 0, x: -10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <div className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r ${plan.gradient} flex items-center justify-center mt-0.5`}>
                    <Check className="w-3 h-3 text-black" />
                  </div>
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </motion.li>
              ))}
            </ul>
            
            {/* CTA Button */}
            <Link href={plan.price === 0 ? '/signup' : '/signup?plan=' + plan.name.toLowerCase()}>
              <motion.button
                className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-neon-cyan to-neon-magenta text-black hover:shadow-[0_0_30px_rgba(0,255,255,0.3)]'
                    : 'border border-white/20 text-foreground hover:border-neon-cyan/50 hover:text-neon-cyan'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {plan.popular && <Zap className="w-4 h-4" />}
                {plan.cta}
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function Pricing() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const [isAnnual, setIsAnnual] = useState(true);
  
  return (
    <section ref={sectionRef} id="pricing" className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-mesh opacity-30" />
      <div className="absolute inset-0 cyber-grid opacity-15" />
      
      {/* Floating elements */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        className="absolute top-1/4 -left-20 w-96 h-96 border border-neon-cyan/10 rounded-full"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] border border-neon-magenta/10 rounded-full"
      />
      
      <div className="container mx-auto px-4 sm:px-6 relative">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-neon-magenta/30 mb-6"
          >
            <Sparkles className="w-4 h-4 text-neon-magenta" />
            <span className="text-sm font-medium text-neon-magenta">Simple, Transparent Pricing</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
          >
            <span className="text-foreground">Choose your </span>
            <span className="gradient-text">plan</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground"
          >
            Start free and scale as you grow. No hidden fees.
          </motion.p>
          
          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-4 mt-8"
          >
            <span className={`text-sm ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-14 h-7 rounded-full bg-surface border border-white/10"
            >
              <motion.div
                className="absolute top-1 w-5 h-5 rounded-full bg-gradient-to-r from-neon-cyan to-neon-magenta"
                animate={{ left: isAnnual ? '32px' : '4px' }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
            <span className={`text-sm ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Annual
              <span className="ml-2 px-2 py-0.5 rounded-full bg-neon-lime/20 text-neon-lime text-xs">
                Save 20%
              </span>
            </span>
          </motion.div>
        </div>
        
        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {plans.map((plan, index) => (
            <PricingCard3D key={plan.name} plan={plan} index={index} />
          ))}
        </div>
        
        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1 }}
          className="text-center text-sm text-muted-foreground mt-12"
        >
          All plans include 14-day money-back guarantee. No questions asked.
        </motion.p>
      </div>
    </section>
  );
}
