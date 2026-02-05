'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { Play, Sparkles, ArrowRight, Volume2, Zap } from 'lucide-react';

// Particle system for background
const ParticleField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationId: number;
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      color: string;
    }> = [];
    
    const colors = ['#00ffff', '#ff00ff', '#00ff00'];
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    const createParticle = () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.2,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
    
    const init = () => {
      resize();
      particles = Array.from({ length: 100 }, createParticle);
    };
    
    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 150) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 255, 255, ${0.1 * (1 - distance / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      drawConnections();
      
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace(')', `, ${p.opacity})`).replace('rgb', 'rgba');
        ctx.fill();
        
        // Glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    init();
    animate();
    window.addEventListener('resize', resize);
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
};

// 3D Floating Voice Visualizer
const VoiceVisualizer3D = () => {
  const bars = 20;
  
  return (
    <div className="relative w-full h-32 flex items-end justify-center gap-1">
      {Array.from({ length: bars }).map((_, i) => {
        const delay = i * 0.05;
        const height = 20 + Math.random() * 80;
        
        return (
          <motion.div
            key={i}
            className="w-2 rounded-full"
            initial={{ height: 20 }}
            animate={{ 
              height: [20, height, 20],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.8 + Math.random() * 0.4,
              delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              background: 'linear-gradient(to top, hsl(180 100% 50%), hsl(320 100% 60%))',
              boxShadow: '0 0 10px hsl(180 100% 50% / 0.5)',
            }}
          />
        );
      })}
    </div>
  );
};

// 3D Rotating Ring
const OrbitRing = ({ delay = 0, size = 300 }: { delay?: number; size?: number }) => (
  <motion.div
    className="absolute rounded-full"
    style={{ 
      width: size, 
      height: size,
      left: '50%',
      top: '50%',
      marginLeft: -size / 2,
      marginTop: -size / 2,
      border: '1px solid hsl(180 100% 50% / 0.2)',
    }}
    animate={{ 
      rotateX: [0, 360],
      rotateY: [0, 180],
    }}
    transition={{
      duration: 20 + delay * 5,
      delay,
      repeat: Infinity,
      ease: "linear",
    }}
  />
);

// Glowing Orb
const GlowingOrb = ({ 
  color, 
  size, 
  position,
  delay = 0,
}: { 
  color: string; 
  size: number; 
  position: { top?: string; left?: string; right?: string; bottom?: string };
  delay?: number;
}) => (
  <motion.div
    className="absolute rounded-full blur-3xl"
    style={{
      ...position,
      width: size,
      height: size,
      background: color,
    }}
    animate={{
      scale: [1, 1.2, 1],
      opacity: [0.3, 0.5, 0.3],
    }}
    transition={{
      duration: 4,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  // Subtle parallax on scroll
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  
  // 3D mouse tracking - subtle effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(mouseY, [-500, 500], [3, -3]), { stiffness: 50, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-500, 500], [-3, 3]), { stiffness: 50, damping: 30 });
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  }, [mouseX, mouseY]);

  const [typedText, setTypedText] = useState('');
  const fullText = 'Welcome to the future of voice.';
  
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 50);
    return () => clearInterval(timer);
  }, []);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Particle Background */}
      <ParticleField />
      
      {/* Gradient Mesh Background */}
      <div className="absolute inset-0 gradient-mesh opacity-60" />
      
      {/* Cyber Grid */}
      <div className="absolute inset-0 cyber-grid opacity-30" />
      
      {/* Glowing Orbs */}
      <GlowingOrb 
        color="hsl(180 100% 50% / 0.2)" 
        size={600} 
        position={{ top: '-10%', left: '-10%' }}
        delay={0}
      />
      <GlowingOrb 
        color="hsl(320 100% 60% / 0.15)" 
        size={500} 
        position={{ bottom: '-10%', right: '-10%' }}
        delay={1}
      />
      <GlowingOrb 
        color="hsl(120 100% 50% / 0.1)" 
        size={400} 
        position={{ top: '40%', right: '10%' }}
        delay={2}
      />
      
      {/* 3D Orbit Rings */}
      <div className="absolute inset-0 preserve-3d pointer-events-none" style={{ perspective: '1000px' }}>
        <OrbitRing size={400} delay={0} />
        <OrbitRing size={500} delay={2} />
        <OrbitRing size={600} delay={4} />
      </div>
      
      {/* Main Content */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-20 container mx-auto px-4 sm:px-6 py-20"
      >
        <motion.div
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
          className="max-w-5xl mx-auto text-center perspective-container"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
            style={{ border: '1px solid hsl(180 100% 50% / 0.3)' }}
          >
            <span className="relative flex h-2 w-2">
              <span 
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" 
                style={{ backgroundColor: 'hsl(180 100% 50%)' }}
              />
              <span 
                className="relative inline-flex rounded-full h-2 w-2" 
                style={{ backgroundColor: 'hsl(180 100% 50%)' }}
              />
            </span>
            <span className="text-sm font-medium" style={{ color: 'hsl(180 100% 50%)' }}>
              Next-Gen Voice AI Platform
            </span>
            <Sparkles className="w-4 h-4" style={{ color: 'hsl(320 100% 60%)' }} />
          </motion.div>
          
          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6"
          >
            <span className="text-foreground">Transform</span>
            <br />
            <span className="gradient-text-tri">Text to Voice</span>
            <br />
            <span className="text-foreground">with AI</span>
          </motion.h1>
          
          {/* Typewriter Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl sm:text-2xl text-muted-foreground mb-4 h-8"
          >
            <span className="text-glow-cyan">{typedText}</span>
            <span className="animate-pulse" style={{ color: 'hsl(180 100% 50%)' }}>|</span>
          </motion.p>
          
          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Clone any voice. Generate ultra-realistic speech. 
            Create content in 29+ languages with cutting-edge neural voice synthesis.
          </motion.p>
          
          {/* Voice Visualizer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-10"
          >
            <VoiceVisualizer3D />
          </motion.div>
          
          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/signup">
              <motion.button
                className="group relative px-8 py-4 rounded-xl btn-neon text-lg font-semibold overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Start Creating Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>
            </Link>
            
            <motion.button
              className="group px-8 py-4 rounded-xl btn-cyber text-lg font-semibold flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Play className="w-5 h-5" />
              Watch Demo
              <Volume2 className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          </motion.div>
          
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {[
              { value: '10M+', label: 'Voices Generated' },
              { value: '50ms', label: 'Avg. Latency' },
              { value: '29+', label: 'Languages' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.7 + i * 0.1 }}
                className="glass rounded-xl p-4 transition-colors group stat-card"
                style={{ border: '1px solid rgba(255, 255, 255, 0.05)' }}
              >
                <div className="text-2xl sm:text-3xl font-bold gradient-text group-hover:text-glow-cyan transition-all">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
      
      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 rounded-full flex items-start justify-center p-2"
          style={{ border: '2px solid hsl(180 100% 50% / 0.5)' }}
        >
          <motion.div
            animate={{ height: ['20%', '80%', '20%'] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 rounded-full"
            style={{ backgroundColor: 'hsl(180 100% 50%)' }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
