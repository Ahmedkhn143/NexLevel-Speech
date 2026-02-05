'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';

// Animated data streams
const DataStream = ({ left, delay }: { left: number; delay: number }) => (
  <motion.div
    className="absolute w-[1px] h-32"
    style={{ left: `${left}%` }}
    initial={{ top: '-128px', opacity: 0 }}
    animate={{ top: '100%', opacity: [0, 1, 1, 0] }}
    transition={{
      duration: 4,
      delay,
      repeat: Infinity,
      ease: 'linear',
    }}
  >
    <div className="w-full h-full bg-gradient-to-b from-transparent via-neon-cyan/50 to-transparent" />
  </motion.div>
);

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div 
          className="relative w-12 h-12"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <div className="absolute inset-0 rounded-full border-2 border-neon-cyan/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-neon-cyan" />
        </motion.div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden relative">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Gradient mesh */}
        <div className="absolute inset-0 gradient-mesh opacity-40" />
        
        {/* Cyber grid */}
        <div className="absolute inset-0 cyber-grid opacity-20" />
        
        {/* Data streams */}
        {[5, 15, 25, 35, 45, 55, 65, 75, 85, 95].map((left, i) => (
          <DataStream key={i} left={left} delay={i * 0.4} />
        ))}
        
        {/* Floating orbs */}
        <motion.div
          className="absolute -top-40 -left-40 w-80 h-80 bg-neon-cyan/10 rounded-full blur-[100px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-neon-magenta/10 rounded-full blur-[120px]"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <motion.div 
            className="relative"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan to-neon-magenta rounded-xl blur-lg opacity-50 group-hover:opacity-80 transition-opacity" />
            
            {/* Icon */}
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-magenta flex items-center justify-center">
              <Zap className="w-5 h-5 text-black" />
            </div>
          </motion.div>
          <span className="text-xl font-bold tracking-tight">
            <span className="text-foreground">Nex</span>
            <span className="gradient-text">Level</span>
          </span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {/* Card glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-neon-cyan/20 via-neon-magenta/20 to-neon-lime/20 rounded-3xl blur-xl" />
          
          {/* Card */}
          <div className="relative glass-heavy rounded-2xl border border-white/10 p-8 overflow-hidden">
            {/* Top gradient line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-neon-cyan via-neon-magenta to-neon-lime" />
            
            {/* Holographic overlay */}
            <div className="absolute inset-0 holographic opacity-20 pointer-events-none" />
            
            {/* Content */}
            <div className="relative">
              {children}
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-6 text-center">
        <motion.p 
          className="text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          © {new Date().getFullYear()} NexLevel Speech. All rights reserved.
        </motion.p>
      </footer>
    </div>
  );
}
