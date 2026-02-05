'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Zap, Play, Sparkles } from 'lucide-react';

// Particle configuration type
interface ParticleConfig {
  delay: number;
  duration: number;
  x: number;
  y: number;
}

// Animated particles
const Particle = ({ delay, duration, x, y }: ParticleConfig) => (
  <motion.div
    className="absolute w-1 h-1 rounded-full bg-neon-cyan"
    style={{ left: `${x}%`, top: `${y}%` }}
    animate={{
      y: [0, -100, 0],
      opacity: [0, 1, 0],
      scale: [0, 1.5, 0],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: 'easeOut',
    }}
  />
);

// Data stream lines
const DataStream = ({ left, delay }: { left: number; delay: number }) => (
  <motion.div
    className="absolute w-[1px] h-20"
    style={{ left: `${left}%` }}
    initial={{ top: '-80px', opacity: 0 }}
    animate={{ top: '100%', opacity: [0, 1, 1, 0] }}
    transition={{
      duration: 3,
      delay,
      repeat: Infinity,
      ease: 'linear',
    }}
  >
    <div className="w-full h-full bg-gradient-to-b from-transparent via-neon-cyan to-transparent" />
  </motion.div>
);

export default function CTA() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const [particles, setParticles] = useState<ParticleConfig[]>([]);

  // Generate particles only on the client to avoid hydration mismatch
  useEffect(() => {
    const particleConfigs: ParticleConfig[] = Array.from({ length: 20 }).map((_, i) => ({
      delay: i * 0.3,
      duration: 3 + Math.random() * 2,
      x: Math.random() * 100,
      y: 20 + Math.random() * 60,
    }));
    setParticles(particleConfigs);
  }, []);
  
  return (
    <section ref={sectionRef} className="relative py-32 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 gradient-mesh opacity-50" />
      <div className="absolute inset-0 cyber-grid opacity-20" />
      
      {/* Data streams */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[10, 25, 40, 55, 70, 85].map((left, i) => (
          <DataStream key={i} left={left} delay={i * 0.5} />
        ))}
      </div>
      
      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle, i) => (
          <Particle key={i} {...particle} />
        ))}
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="relative max-w-5xl mx-auto"
        >
          {/* Glow backdrop */}
          <div className="absolute -inset-4 bg-gradient-to-r from-neon-cyan/20 via-neon-magenta/20 to-neon-lime/20 rounded-3xl blur-3xl opacity-50" />
          
          {/* Main card */}
          <div className="relative glass-heavy rounded-3xl border border-white/10 overflow-hidden">
            {/* Top gradient line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-neon-cyan via-neon-magenta to-neon-lime" />
            
            {/* Holographic overlay */}
            <div className="absolute inset-0 holographic opacity-30" />
            
            {/* Content */}
            <div className="relative px-8 py-16 sm:px-16 sm:py-20 text-center">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 mb-8"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="w-4 h-4 text-neon-cyan" />
                </motion.div>
                <span className="text-sm font-medium text-neon-cyan">
                  Start Creating Today
                </span>
              </motion.div>
              
              {/* Heading */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
              >
                <span className="text-foreground">Ready to revolutionize</span>
                <br />
                <span className="gradient-text-tri">your voice content?</span>
              </motion.h2>
              
              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4 }}
                className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
              >
                Join thousands of creators, developers, and enterprises using 
                NexLevel to transform text into stunning voice content.
              </motion.p>
              
              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Link href="/signup">
                  <motion.button
                    className="group relative px-8 py-4 rounded-xl overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Animated gradient background */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-neon-cyan via-neon-magenta to-neon-lime"
                      animate={{
                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                      }}
                      transition={{ duration: 5, repeat: Infinity }}
                      style={{ backgroundSize: '200% 100%' }}
                    />
                    
                    {/* Shimmer */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    
                    <span className="relative flex items-center gap-2 text-black font-bold text-lg">
                      <Zap className="w-5 h-5" />
                      Get Started Free
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </motion.button>
                </Link>
                
                <motion.button
                  className="group px-8 py-4 rounded-xl border border-white/20 hover:border-neon-cyan/50 transition-colors flex items-center gap-2 text-foreground font-semibold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-neon-cyan/20 transition-colors">
                    <Play className="w-4 h-4 ml-0.5" />
                  </div>
                  Watch Demo
                </motion.button>
              </motion.div>
              
              {/* Trust badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.7 }}
                className="mt-12 flex flex-wrap items-center justify-center gap-8 text-muted-foreground text-sm"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-neon-lime animate-pulse" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
                  <span>10,000 free characters</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-neon-magenta animate-pulse" />
                  <span>Cancel anytime</span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
