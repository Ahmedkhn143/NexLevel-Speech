'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Zap, ChevronRight, Sparkles } from 'lucide-react';

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#demo', label: 'Demo' },
  { href: '#docs', label: 'Docs' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'py-3' 
            : 'py-5'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <nav 
            className={`relative flex items-center justify-between px-6 py-3 rounded-2xl transition-all duration-500 ${
              isScrolled 
                ? 'glass-heavy border border-white/10 shadow-2xl' 
                : 'bg-transparent'
            }`}
          >
            {/* Logo */}
            <Link href="/" className="group flex items-center gap-3">
              <motion.div 
                className="relative w-10 h-10"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                {/* Glow background */}
                <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan to-neon-magenta rounded-xl blur-lg opacity-50 group-hover:opacity-80 transition-opacity" />
                
                {/* Icon container */}
                <div className="relative w-full h-full rounded-xl bg-gradient-to-br from-neon-cyan to-neon-magenta flex items-center justify-center">
                  <Zap className="w-5 h-5 text-black" />
                </div>
              </motion.div>
              
              <span className="text-xl font-bold tracking-tight">
                <span className="text-foreground">Nex</span>
                <span className="gradient-text">Level</span>
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <span className="relative z-10">{link.label}</span>
                  <motion.div
                    className="absolute inset-0 rounded-lg bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"
                    layoutId="nav-hover"
                  />
                </Link>
              ))}
            </div>
            
            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign In
              </Link>
              
              <Link href="/signup">
                <motion.button
                  className="relative group px-5 py-2.5 rounded-xl overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan to-neon-magenta" />
                  
                  {/* Shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  
                  {/* Content */}
                  <span className="relative flex items-center gap-2 text-sm font-semibold text-black">
                    Get Started
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </motion.button>
              </Link>
            </div>
            
            {/* Mobile Menu Button */}
            <motion.button
              className="lg:hidden p-2 rounded-xl glass border border-white/10"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileTap={{ scale: 0.95 }}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </motion.button>
          </nav>
        </div>
      </motion.header>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-xl z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Menu Panel */}
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm z-50 lg:hidden"
            >
              <div className="h-full glass-heavy border-l border-white/10 p-6 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-magenta flex items-center justify-center">
                      <Zap className="w-5 h-5 text-black" />
                    </div>
                    <span className="text-xl font-bold">
                      <span className="text-foreground">Nex</span>
                      <span className="gradient-text">Level</span>
                    </span>
                  </div>
                  
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-xl glass border border-white/10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Links */}
                <nav className="flex-1 space-y-2">
                  {navLinks.map((link, i) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-between p-4 rounded-xl glass border border-white/5 hover:border-neon-cyan/30 transition-colors group"
                      >
                        <span className="font-medium">{link.label}</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-neon-cyan group-hover:translate-x-1 transition-all" />
                      </Link>
                    </motion.div>
                  ))}
                </nav>
                
                {/* Bottom CTAs */}
                <div className="space-y-3 pt-6 border-t border-white/10">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full py-3 text-center rounded-xl border border-white/10 hover:border-white/20 transition-colors font-medium"
                  >
                    Sign In
                  </Link>
                  
                  <Link
                    href="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full py-3 text-center rounded-xl bg-gradient-to-r from-neon-cyan to-neon-magenta text-black font-semibold"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Get Started Free
                    </span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
