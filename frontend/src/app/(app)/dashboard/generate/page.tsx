'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Play,
  Pause,
  Download,
  Loader2,
  AlertCircle,
  Check,
  Volume2,
  Clock,
  Zap,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ttsApi, voiceApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface Voice {
  id: string;
  name: string;
  externalVoiceId: string;
  provider: string;
}

interface GenerationResult {
  id: string;
  audioUrl: string;
  characterCount: number;
  duration: number;
  creditsCost: number;
  remainingCredits: number;
}

// Preset demo voices
const PRESET_VOICES = [
  { id: 'pre_rachel', name: 'Rachel (American)', description: 'Warm, conversational' },
  { id: 'pre_drew', name: 'Drew (American)', description: 'Professional, deep' },
  { id: 'pre_clyde', name: 'Clyde (American)', description: 'Friendly, casual' },
  { id: 'pre_mimi', name: 'Mimi (Swedish)', description: 'Soft, expressive' },
];

// Animated audio waveform
function AudioWaveform({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="flex items-center gap-0.5 h-12">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-gradient-to-t from-neon-cyan to-neon-magenta rounded-full"
          animate={isPlaying ? {
            height: [8, 32, 8, 24, 8],
          } : {
            height: 8,
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.05,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// Circular progress indicator
function CircularProgress({ progress }: { progress: number }) {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="64"
          cy="64"
          r="45"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          className="text-white/10"
        />
        <motion.circle
          cx="64"
          cy="64"
          r="45"
          stroke="url(#progressGradient)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset,
          }}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.3 }}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(180, 100%, 50%)" />
            <stop offset="100%" stopColor="hsl(320, 100%, 60%)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold gradient-text">{progress}%</span>
      </div>
    </div>
  );
}

export default function GeneratePage() {
  const { user, refreshUser } = useAuth();
  
  // Form state
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<string>('pre_rachel');
  const [isVoiceDropdownOpen, setIsVoiceDropdownOpen] = useState(false);
  
  // Voice loading state
  const [voices, setVoices] = useState<Voice[]>([]);
  const [isLoadingVoices, setIsLoadingVoices] = useState(true);
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate available credits
  const availableCredits = user?.credits
    ? user.credits.totalCredits - user.credits.usedCredits + user.credits.bonusCredits
    : 0;

  // Character count and limits
  const MIN_CHARACTERS = 2;
  const MAX_CHARACTERS = 200000;
  const characterCount = text.replace(/\s/g, '').length;
  const hasEnoughCredits = availableCredits >= characterCount;
  const hasMinimumCharacters = characterCount >= MIN_CHARACTERS;

  // Fetch user voices
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const { data } = await voiceApi.getVoices();
        setVoices(data || []);
      } catch (err) {
        console.error('Failed to fetch voices:', err);
      } finally {
        setIsLoadingVoices(false);
      }
    };
    fetchVoices();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsVoiceDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Audio player handlers
  useEffect(() => {
    if (!result?.audioUrl) return;

    const audio = new Audio(result.audioUrl);
    audioRef.current = audio;

    audio.addEventListener('timeupdate', () => {
      setAudioProgress((audio.currentTime / audio.duration) * 100 || 0);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setAudioProgress(0);
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [result?.audioUrl]);

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text to generate');
      return;
    }

    if (!hasMinimumCharacters) {
      toast.error(`Please enter at least ${MIN_CHARACTERS} characters`);
      return;
    }

    if (!hasEnoughCredits) {
      toast.error(`Insufficient credits. You need ${characterCount} but have ${availableCredits}`);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResult(null);
    setGenerationProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setGenerationProgress((prev) => Math.min(prev + 10, 90));
    }, 500);

    try {
      const { data } = await ttsApi.generate({
        voiceId: selectedVoice,
        text: text.trim(),
        language: 'en',
      });

      setGenerationProgress(100);
      setResult(data);
      
      await refreshUser();
      toast.success('Audio generated successfully!');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to generate audio. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      clearInterval(progressInterval);
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!result?.audioUrl) return;

    const link = document.createElement('a');
    link.href = result.audioUrl;
    link.download = `nexlevel-speech-${result.id}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSelectedVoiceName = () => {
    const preset = PRESET_VOICES.find((v) => v.id === selectedVoice);
    if (preset) return preset.name;
    
    const custom = voices.find((v) => v.id === selectedVoice);
    return custom?.name || 'Select a voice';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl lg:text-4xl font-bold mb-3">
          <span className="text-foreground">Generate </span>
          <span className="gradient-text">Speech</span>
        </h1>
        <p className="text-muted-foreground">
          Transform your text into natural-sounding audio using AI voices
        </p>
      </motion.div>

      {/* Main Generation Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card variant="glass" className="overflow-hidden border-white/10">
          <div className="p-6 space-y-6">
            {/* Voice Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Mic className="w-4 h-4 text-neon-cyan" />
                Voice
              </label>
              <div ref={dropdownRef} className="relative">
                <motion.button
                  onClick={() => setIsVoiceDropdownOpen(!isVoiceDropdownOpen)}
                  className="w-full flex items-center justify-between px-4 py-3.5 glass border border-white/10 rounded-xl hover:border-neon-cyan/50 transition-all text-left group"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-magenta/20 flex items-center justify-center">
                      <Mic className="w-5 h-5 text-neon-cyan" />
                    </div>
                    <span className="font-medium text-foreground">{getSelectedVoiceName()}</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isVoiceDropdownOpen ? 'rotate-180' : ''}`} />
                </motion.button>

                <AnimatePresence>
                  {isVoiceDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute top-full left-0 right-0 mt-2 glass-heavy border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden max-h-64 overflow-y-auto"
                    >
                      {/* Preset voices */}
                      <div className="p-2 border-b border-white/5">
                        <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                          System Voices
                        </p>
                        {PRESET_VOICES.map((voice) => (
                          <motion.button
                            key={voice.id}
                            onClick={() => {
                              setSelectedVoice(voice.id);
                              setIsVoiceDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                              selectedVoice === voice.id
                                ? 'bg-gradient-to-r from-neon-cyan/20 to-neon-magenta/10 border border-neon-cyan/30'
                                : 'hover:bg-white/5'
                            }`}
                            whileHover={{ x: 4 }}
                          >
                            <div>
                              <p className={`font-medium text-left ${selectedVoice === voice.id ? 'text-neon-cyan' : 'text-foreground'}`}>
                                {voice.name}
                              </p>
                              <p className="text-xs text-muted-foreground">{voice.description}</p>
                            </div>
                            {selectedVoice === voice.id && <Check className="w-4 h-4 text-neon-cyan" />}
                          </motion.button>
                        ))}
                      </div>

                      {/* User voices */}
                      {!isLoadingVoices && voices.length > 0 && (
                        <div className="p-2">
                          <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                            Your Cloned Voices
                          </p>
                          {voices.map((voice) => (
                            <motion.button
                              key={voice.id}
                              onClick={() => {
                                setSelectedVoice(voice.id);
                                setIsVoiceDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                                selectedVoice === voice.id
                                  ? 'bg-gradient-to-r from-neon-cyan/20 to-neon-magenta/10 border border-neon-cyan/30'
                                  : 'hover:bg-white/5'
                              }`}
                              whileHover={{ x: 4 }}
                            >
                              <p className={`font-medium ${selectedVoice === voice.id ? 'text-neon-cyan' : 'text-foreground'}`}>
                                {voice.name}
                              </p>
                              {selectedVoice === voice.id && <Check className="w-4 h-4 text-neon-cyan" />}
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Text Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-neon-magenta" />
                  Text
                </label>
                <span className={`text-xs font-medium ${characterCount > 0 && (!hasEnoughCredits || !hasMinimumCharacters) ? 'text-red-400' : 'text-muted-foreground'}`}>
                  {characterCount.toLocaleString()} characters (min {MIN_CHARACTERS})
                </span>
              </div>
              <div className="relative">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter the text you want to convert to speech..."
                  className="w-full h-48 px-4 py-3 glass border border-white/10 rounded-xl resize-none focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/30 transition-all text-foreground placeholder:text-muted-foreground/50"
                  maxLength={MAX_CHARACTERS}
                />
                {/* Character limit indicator */}
                <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                  {text.length.toLocaleString()} / {MAX_CHARACTERS.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Credits Info */}
            <motion.div 
              className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-neon-cyan/5 to-neon-magenta/5 border border-white/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-neon-cyan" />
                  <span className="text-sm">
                    <span className="font-bold text-foreground">{availableCredits.toLocaleString()}</span>
                    <span className="text-muted-foreground"> credits available</span>
                  </span>
                </div>
                {characterCount > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">→</span>
                    <span className={`text-sm font-bold ${hasEnoughCredits ? 'text-neon-lime' : 'text-red-400'}`}>
                      {characterCount.toLocaleString()} credits needed
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !text.trim() || !hasEnoughCredits || !hasMinimumCharacters}
              variant="neon"
              size="lg"
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5 mr-2" />
                  Generate Speech
                </>
              )}
            </Button>

            {/* Progress Indicator */}
            <AnimatePresence>
              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center justify-center py-8"
                >
                  <CircularProgress progress={generationProgress} />
                  <p className="mt-4 text-sm text-muted-foreground">Processing your request...</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-400">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Result Section */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-white/10"
              >
                <div className="p-6 space-y-6">
                  <div className="flex items-center gap-2 text-neon-lime">
                    <Check className="w-5 h-5" />
                    <span className="font-bold">Audio generated successfully!</span>
                  </div>

                  {/* Audio Player */}
                  <div className="p-6 rounded-xl bg-gradient-to-r from-neon-cyan/5 to-neon-magenta/5 border border-white/10">
                    <div className="flex items-center gap-6">
                      <motion.button
                        onClick={togglePlayback}
                        className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-cyan to-neon-magenta flex items-center justify-center text-black flex-shrink-0"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {isPlaying ? (
                          <Pause className="w-6 h-6" />
                        ) : (
                          <Play className="w-6 h-6 ml-1" />
                        )}
                      </motion.button>

                      <div className="flex-1 space-y-3">
                        {/* Waveform */}
                        <AudioWaveform isPlaying={isPlaying} />
                        
                        {/* Progress bar */}
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-neon-cyan to-neon-magenta"
                            style={{ width: `${audioProgress}%` }}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {result.duration?.toFixed(1)}s
                          </span>
                          <span className="flex items-center gap-1">
                            <Volume2 className="w-3 h-3" />
                            MP3
                          </span>
                        </div>
                      </div>

                      <Button
                        onClick={handleDownload}
                        variant="cyber"
                        className="flex-shrink-0"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Download</span>
                      </Button>
                    </div>
                  </div>

                  {/* Generation Details */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                      { label: 'Characters', value: result.characterCount.toLocaleString(), color: 'neon-cyan' },
                      { label: 'Credits Used', value: result.creditsCost.toLocaleString(), color: 'neon-magenta' },
                      { label: 'Remaining', value: result.remainingCredits.toLocaleString(), color: 'neon-lime' },
                    ].map((item) => (
                      <div key={item.label} className="p-4 rounded-xl glass border border-white/10">
                        <p className="text-muted-foreground text-xs mb-1">{item.label}</p>
                        <p className={`text-lg font-bold text-${item.color}`}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* Tips Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card variant="glass" className="p-6 border-white/10">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <span className="text-xl">💡</span>
            Tips for best results
          </h3>
          <ul className="space-y-3">
            {[
              'Use proper punctuation for natural pauses and intonation',
              'Break long text into smaller paragraphs for better flow',
              'Spell out abbreviations and numbers for clarity',
            ].map((tip, index) => (
              <motion.li 
                key={index}
                className="flex items-start gap-3 text-sm text-muted-foreground"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan mt-2 flex-shrink-0" />
                {tip}
              </motion.li>
            ))}
          </ul>
        </Card>
      </motion.div>
    </div>
  );
}
