'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Play, 
  Clock, 
  ArrowRight, 
  Zap, 
  Star, 
  Mic, 
  TrendingUp,
  Sparkles,
  Volume2
} from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';

interface Generation {
  id: string;
  text: string;
  createdAt: string;
  voice: { name: string };
  duration: number;
  audioUrl?: string;
}

interface QuickStat {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  gradient: string;
  glowColor: string;
}

// Animated waveform component
function AnimatedWaveform() {
  return (
    <div className="flex items-end gap-0.5 h-8">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-gradient-to-t from-neon-cyan to-neon-magenta rounded-full"
          animate={{
            height: [8, 24, 8],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// Stats card with 3D effect
function StatCard3D({ stat, index }: { stat: QuickStat; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: -10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="relative group"
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10"
        style={{ background: stat.gradient }}
      />
      
      <Card variant="glass" className="relative overflow-hidden border-white/10 group-hover:border-white/20">
        {/* Glow effect */}
        <div 
          className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"
          style={{ background: stat.glowColor }}
        />
        
        {/* Scan line */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100"
          animate={{ y: ['-100%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
        
        <div className="relative p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              {stat.label}
            </span>
            <div 
              className="p-2.5 rounded-xl"
              style={{ background: stat.gradient }}
            >
              {stat.icon}
            </div>
          </div>
          
          <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
          
          {stat.trend && (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neon-lime animate-pulse" />
              <span className="text-sm text-neon-lime font-medium">{stat.trend}</span>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

// Quick action card with hover effects
function QuickActionCard({ 
  href, 
  icon: Icon, 
  title, 
  description, 
  gradient,
  delay 
}: { 
  href: string; 
  icon: React.ElementType; 
  title: string; 
  description: string;
  gradient: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Link href={href}>
        <motion.div
          className="relative p-6 rounded-2xl glass border border-white/10 overflow-hidden group cursor-pointer"
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Background gradient on hover */}
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: gradient }}
          />
          
          {/* Icon */}
          <div className="relative mb-4">
            <motion.div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: gradient }}
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <Icon className="w-7 h-7 text-white" />
            </motion.div>
          </div>
          
          {/* Content */}
          <h3 className="relative text-lg font-bold text-foreground mb-1 group-hover:text-white transition-colors">
            {title}
          </h3>
          <p className="relative text-sm text-muted-foreground group-hover:text-white/70 transition-colors">
            {description}
          </p>
          
          {/* Arrow indicator */}
          <motion.div
            className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity"
            initial={{ x: -10 }}
            whileHover={{ x: 0 }}
          >
            <ArrowRight className="w-5 h-5 text-white" />
          </motion.div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

// Loading skeleton
function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-6 rounded-2xl glass border border-white/10 animate-pulse">
          <div className="flex justify-between mb-4">
            <div className="h-3 w-24 bg-white/10 rounded" />
            <div className="w-10 h-10 bg-white/10 rounded-xl" />
          </div>
          <div className="h-8 w-32 bg-white/10 rounded mb-2" />
          <div className="h-4 w-20 bg-white/10 rounded" />
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [recentGenerations, setRecentGenerations] = useState<Generation[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get('/tts/history?limit=5');
        setRecentGenerations(data.data || []);
      } catch (err) {
        console.error('Failed to fetch history:', err);
        setError('Failed to load recent generations');
        setRecentGenerations([]);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    fetchHistory();
  }, []);

  // Calculate stats
  const totalCredits = user?.credits?.totalCredits || 0;
  const usedCredits = user?.credits?.usedCredits || 0;
  const bonusCredits = user?.credits?.bonusCredits || 0;
  const availableCredits = totalCredits - usedCredits + bonusCredits;
  
  const stats: QuickStat[] = [
    {
      label: 'Available Credits',
      value: availableCredits.toLocaleString(),
      icon: <Zap className="w-5 h-5 text-white" />,
      trend: '+500 bonus',
      gradient: 'linear-gradient(135deg, hsl(180, 100%, 50%), hsl(200, 100%, 50%))',
      glowColor: 'hsl(180, 100%, 50%)',
    },
    {
      label: 'Characters Used',
      value: usedCredits.toLocaleString(),
      icon: <TrendingUp className="w-5 h-5 text-white" />,
      gradient: 'linear-gradient(135deg, hsl(320, 100%, 60%), hsl(280, 100%, 60%))',
      glowColor: 'hsl(320, 100%, 60%)',
    },
    {
      label: 'Current Plan',
      value: user?.subscription?.plan?.displayName || 'Starter',
      icon: <Star className="w-5 h-5 text-white" />,
      trend: 'Active',
      gradient: 'linear-gradient(135deg, hsl(120, 100%, 50%), hsl(180, 100%, 50%))',
      glowColor: 'hsl(120, 100%, 50%)',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-6"
      >
        <div>
          <motion.h1 
            className="text-3xl lg:text-4xl font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <span className="text-foreground">Welcome back, </span>
            <span className="gradient-text">{user?.name?.split(' ')[0] || 'Creator'}</span>
          </motion.h1>
          <motion.p 
            className="text-muted-foreground mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Here's what's happening with your voice studio today.
          </motion.p>
        </div>
        
        <motion.div
          className="flex flex-col sm:flex-row gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Link href="/dashboard/voices">
            <Button variant="secondary" className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Clone Voice
            </Button>
          </Link>
          <Link href="/dashboard/generate">
            <Button variant="neon" className="w-full sm:w-auto">
              <Mic className="w-4 h-4 mr-2" />
              Generate Speech
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Stats Grid */}
      {!user ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <StatCard3D key={stat.label} stat={stat} index={index} />
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-neon-cyan" />
          Quick Actions
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickActionCard
            href="/dashboard/generate"
            icon={Mic}
            title="Text to Speech"
            description="Generate audio from text"
            gradient="linear-gradient(135deg, hsla(180, 100%, 50%, 0.2), hsla(200, 100%, 50%, 0.1))"
            delay={0.5}
          />
          <QuickActionCard
            href="/dashboard/voices"
            icon={Plus}
            title="Clone a Voice"
            description="Create your AI voice"
            gradient="linear-gradient(135deg, hsla(320, 100%, 60%, 0.2), hsla(280, 100%, 60%, 0.1))"
            delay={0.6}
          />
          <QuickActionCard
            href="/dashboard/history"
            icon={Clock}
            title="View History"
            description="Browse past generations"
            gradient="linear-gradient(135deg, hsla(120, 100%, 50%, 0.2), hsla(180, 100%, 50%, 0.1))"
            delay={0.7}
          />
        </div>
      </motion.div>

      {/* Recent Generations */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Clock className="w-5 h-5 text-neon-magenta" />
            Recent Generations
          </h2>
          <Link 
            href="/dashboard/history" 
            className="text-sm text-neon-cyan hover:text-neon-cyan/80 transition-colors flex items-center gap-1 group"
          >
            View all 
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <Card variant="glass" className="overflow-hidden border-white/10">
          {isLoadingHistory ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="w-12 h-12 rounded-xl bg-white/10" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-white/10 rounded" />
                    <div className="h-3 w-1/2 bg-white/10 rounded" />
                  </div>
                  <div className="h-8 w-20 bg-white/10 rounded-lg" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button 
                variant="secondary" 
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          ) : recentGenerations.length > 0 ? (
            <div className="divide-y divide-white/5">
              {recentGenerations.map((gen, index) => (
                <motion.div
                  key={gen.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors group"
                >
                  {/* Play button */}
                  <motion.button
                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-magenta/20 border border-white/10 flex items-center justify-center text-neon-cyan group-hover:from-neon-cyan group-hover:to-neon-magenta group-hover:text-white transition-all"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPlayingId(playingId === gen.id ? null : gen.id)}
                  >
                    {playingId === gen.id ? (
                      <Volume2 className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5 ml-0.5" />
                    )}
                  </motion.button>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-foreground truncate pr-4">
                      {gen.text}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                      <span className="text-neon-cyan">{gen.voice?.name || 'Unknown Voice'}</span>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                      <span>{new Date(gen.createdAt).toLocaleDateString()}</span>
                      {gen.duration && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                          <span>{gen.duration.toFixed(1)}s</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Waveform visualization */}
                  {playingId === gen.id && (
                    <div className="hidden sm:block">
                      <AnimatedWaveform />
                    </div>
                  )}
                  
                  {/* Download button */}
                  {gen.audioUrl && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex"
                    >
                      Download
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-neon-cyan/20 to-neon-magenta/20 flex items-center justify-center">
                <Clock className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">No generations yet</h3>
              <p className="text-muted-foreground mb-6">
                Start by generating some speech to see your history here.
              </p>
              <Link href="/dashboard/generate">
                <Button variant="neon">
                  <Mic className="w-4 h-4 mr-2" />
                  Generate Speech
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
