'use client';

import { useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  Mic, 
  Zap, 
  Globe2, 
  Shield, 
  Wand2, 
  Layers,
  Cpu,
  Sparkles
} from 'lucide-react';

const features = [
  {
    icon: Mic,
    title: 'Voice Cloning',
    description: 'Clone any voice with just 30 seconds of audio. Create hyper-realistic AI voice replicas.',
    color: 'neon-cyan',
    gradient: 'from-[#00ffff] to-[#0080ff]',
  },
  {
    icon: Zap,
    title: 'Real-time Synthesis',
    description: 'Generate speech in milliseconds. Stream audio as it\'s created for instant results.',
    color: 'neon-magenta',
    gradient: 'from-[#ff00ff] to-[#ff0080]',
  },
  {
    icon: Globe2,
    title: '29+ Languages',
    description: 'Speak to the world. Native-quality synthesis in over 29 languages and accents.',
    color: 'neon-lime',
    gradient: 'from-[#00ff00] to-[#80ff00]',
  },
  {
    icon: Wand2,
    title: 'Style Control',
    description: 'Fine-tune emotion, pace, and emphasis. Create the perfect delivery every time.',
    color: 'neon-cyan',
    gradient: 'from-[#00ffff] to-[#ff00ff]',
  },
  {
    icon: Layers,
    title: 'Voice Library',
    description: 'Access 100+ premium voices. From professional narrators to character voices.',
    color: 'neon-magenta',
    gradient: 'from-[#ff00ff] to-[#00ffff]',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'SOC2 certified. End-to-end encryption. Your voice data stays private.',
    color: 'neon-lime',
    gradient: 'from-[#00ff00] to-[#00ffff]',
  },
];

// 3D Card Component
const FeatureCard3D = ({ 
  feature, 
  index 
}: { 
  feature: typeof features[0]; 
  index: number;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: '-50px' });
  
  // Mouse position for 3D effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Smooth springs for rotation
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), { stiffness: 150, damping: 15 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), { stiffness: 150, damping: 15 });
  
  // Handle mouse movement
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
      initial={{ opacity: 0, y: 50, rotateX: -15 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="perspective-container"
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative group cursor-pointer"
      >
        {/* Glow Effect */}
        <div 
          className={`absolute -inset-0.5 bg-gradient-to-r ${feature.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}
          style={{ transform: 'translateZ(-10px)' }}
        />
        
        {/* Card */}
        <div 
          className="relative glass rounded-2xl border border-white/10 p-6 h-full overflow-hidden group-hover:border-white/20 transition-all duration-500"
          style={{ transform: 'translateZ(0)' }}
        >
          {/* Background gradient */}
          <div 
            className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${feature.gradient} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-500`}
          />
          
          {/* Scan line effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity overflow-hidden">
            <motion.div
              className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/30 to-transparent"
              initial={{ top: '-10%' }}
              animate={{ top: '110%' }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
          </div>
          
          {/* Icon */}
          <motion.div 
            className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} p-[1px] mb-5`}
            style={{ transform: 'translateZ(20px)' }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <div className="w-full h-full rounded-xl bg-background/90 flex items-center justify-center">
              <feature.icon className="w-7 h-7 text-foreground" />
            </div>
            
            {/* Icon glow */}
            <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${feature.gradient} blur-lg opacity-50`} />
          </motion.div>
          
          {/* Content */}
          <h3 
            className="text-xl font-bold text-foreground mb-3 group-hover:gradient-text transition-all"
            style={{ transform: 'translateZ(15px)' }}
          >
            {feature.title}
          </h3>
          
          <p 
            className="text-muted-foreground leading-relaxed"
            style={{ transform: 'translateZ(10px)' }}
          >
            {feature.description}
          </p>
          
          {/* Bottom border glow */}
          <div 
            className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function Features() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  
  return (
    <section ref={sectionRef} id="features" className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-mesh opacity-40" />
      <div className="absolute inset-0 cyber-grid opacity-20" />
      
      {/* Floating orbs */}
      <motion.div
        animate={{ 
          y: [0, -30, 0],
          x: [0, 20, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-20 left-10 w-64 h-64 bg-neon-cyan/10 rounded-full blur-[100px]"
      />
      <motion.div
        animate={{ 
          y: [0, 20, 0],
          x: [0, -30, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-20 right-10 w-80 h-80 bg-neon-magenta/10 rounded-full blur-[120px]"
      />
      
      <div className="container mx-auto px-4 sm:px-6 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-neon-cyan/30 mb-6"
          >
            <Cpu className="w-4 h-4 text-neon-cyan" />
            <span className="text-sm font-medium text-neon-cyan">Powered by Neural Networks</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
          >
            <span className="text-foreground">Cutting-edge </span>
            <span className="gradient-text-tri">Voice AI</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            The most advanced voice synthesis platform. Create, clone, and customize 
            voices with unprecedented quality and control.
          </motion.p>
        </div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <FeatureCard3D key={feature.title} feature={feature} index={index} />
          ))}
        </div>
        
        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-20 text-center"
        >
          <motion.button
            className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-xl overflow-hidden"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Animated border */}
            <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-r from-neon-cyan via-neon-magenta to-neon-lime">
              <div className="absolute inset-0 rounded-xl bg-background" />
            </div>
            
            <span className="relative text-foreground font-semibold">Explore All Features</span>
            <Sparkles className="relative w-4 h-4 text-neon-cyan group-hover:rotate-12 transition-transform" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
