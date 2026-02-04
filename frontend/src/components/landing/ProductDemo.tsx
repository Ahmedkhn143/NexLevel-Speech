'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Mic, Check, Sparkles, Pause, Loader2, Volume2, Wand2 } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const DEMO_TEXTS = {
    en: "Experience the next generation of AI voice cloning. Create content faster than ever.",
    ur: "مصنوعی ذہانت کی اگلی نسل کا تجربہ کریں۔ پہلے سے کہیں زیادہ تیزی سے مواد بنائیں۔",
    es: "Experimenta la próxima generación de clonación de voz por IA.",
};

const VOICES = [
    { id: 'sarah', name: 'Sarah (American)', lang: 'en' },
    { id: 'ahmed', name: 'Ahmed (Urdu/Hindi)', lang: 'ur' },
    { id: 'sofia', name: 'Sofia (Spanish)', lang: 'es' },
];

export default function ProductDemo() {
    const [activeLang, setActiveLang] = useState<'en' | 'ur' | 'es'>('en');
    const [typedText, setTypedText] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    // Initial Typing Effect
    useEffect(() => {
        setTypedText('');
        setAudioUrl(null);
        setIsPlaying(false);
        setIsGenerating(false);

        // Only run typing effect if not analyzing
        let i = 0;
        const targetText = DEMO_TEXTS[activeLang];

        const typeInterval = setInterval(() => {
            if (i < targetText.length) {
                setTypedText(targetText.slice(0, i + 1));
                i++;
            } else {
                clearInterval(typeInterval);
            }
        }, 30);

        return () => clearInterval(typeInterval);
    }, [activeLang]);

    const handleGenerate = async () => {
        if (!typedText) return;
        setIsGenerating(true);
        setAudioUrl(null);

        try {
            // Call Demo API with timeout for better UX
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);
            
            const response = await fetch(`${API_URL}/demo/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: typedText,
                    voiceId: VOICES.find(v => v.lang === activeLang)?.id || 'sarah',
                    lang: activeLang
                }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Generation failed');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);

            // Auto-play when ready
            setTimeout(() => {
                if (audioRef.current) {
                    audioRef.current.play().catch(() => { });
                    setIsPlaying(true);
                }
            }, 100);

        } catch (error: unknown) {
            console.error(error);
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    toast.error('Request timed out. Please try again.');
                } else if (error.message === 'Failed to fetch') {
                    toast.error('Server unavailable. Demo mode active - sign up to try the full experience!');
                } else {
                    toast.error(error.message || 'Generation failed. Please try again.');
                }
            } else {
                toast.error('Something went wrong. Please try again.');
            }
        } finally {
            setIsGenerating(false);
        }
    };

    const togglePlay = () => {
        if (!audioRef.current || !audioUrl) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            setDuration(audioRef.current.duration || 0);
        }
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
    };

    return (
        <section id="demo" className="py-24 relative overflow-hidden scroll-mt-20">
            {/* Hidden Audio Element */}
            <audio
                ref={audioRef}
                src={audioUrl || undefined}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                onLoadedMetadata={handleTimeUpdate}
            />

            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="container relative z-10">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
                    >
                        <Sparkles className="w-4 h-4" />
                        Interactive Demo
                    </motion.div>
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        Experience <span className="gradient-text">Real-Time</span> Generation
                    </h2>
                    <p className="text-gray-400">Try it now. 500 characters free.</p>
                </div>

                <div className="max-w-4xl mx-auto bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                    {/* Toolbar */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/80">
                        <div className="flex items-center gap-2">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {(['en', 'ur', 'es'] as const).map(lang => (
                                <button
                                    key={lang}
                                    onClick={() => setActiveLang(lang)}
                                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${activeLang === lang
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                        : 'bg-gray-800 text-gray-400 hover:text-white'
                                        }`}
                                >
                                    {lang.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 min-h-[400px]">
                        {/* Editor Side */}
                        <div className="md:col-span-2 p-8 border-b md:border-b-0 md:border-r border-gray-800 relative bg-gray-950/30">
                            <div className="absolute top-4 left-4 text-xs font-mono text-gray-500">INPUT TEXT</div>
                            <textarea
                                value={typedText}
                                onChange={(e) => setTypedText(e.target.value)}
                                placeholder="Type something to generate..."
                                maxLength={500}
                                className="w-full h-full bg-transparent border-none resize-none text-xl md:text-2xl leading-relaxed focus:outline-none text-gray-100 font-medium font-sans min-h-[200px]"
                            />
                            <div className="absolute bottom-4 right-4 text-xs text-gray-500 font-mono">
                                {typedText.length}/500
                            </div>
                        </div>

                        {/* Controls Side */}
                        <div className="p-6 bg-gray-900/30 flex flex-col gap-6">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-3 block">VOICE MODEL</label>
                                <div className="space-y-2">
                                    {VOICES.map(voice => (
                                        <button
                                            key={voice.id}
                                            disabled={voice.lang !== activeLang}
                                            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${voice.lang === activeLang
                                                ? 'border-primary bg-primary/10 text-white'
                                                : 'border-gray-800 bg-gray-800/50 text-gray-500 opacity-50 cursor-not-allowed'
                                                }`}
                                        >
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                                                <Mic className="w-4 h-4" />
                                            </div>
                                            <div className="text-left">
                                                <div className="text-sm font-semibold">{voice.name}</div>
                                                <div className="text-[10px] opacity-70">Ultra-Realistic</div>
                                            </div>
                                            {voice.lang === activeLang && <Check className="w-4 h-4 ml-auto text-primary" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-auto space-y-4">
                                <button
                                    onClick={handleGenerate}
                                    disabled={isGenerating || !typedText}
                                    className="w-full btn-primary py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4" />
                                            Generate Speech
                                        </>
                                    )}
                                </button>

                                <AnimatePresence mode="wait">
                                    {(audioUrl || isGenerating) && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="w-full bg-gray-800/50 rounded-xl p-3 border border-gray-700"
                                        >
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={togglePlay}
                                                    disabled={isGenerating}
                                                    className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shrink-0 hover:scale-105 transition-transform"
                                                >
                                                    {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                                                </button>

                                                <div className="flex-1 space-y-1">
                                                    <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                                                        <motion.div
                                                            className="h-full bg-primary"
                                                            style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
                                                        />
                                                    </div>
                                                    <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                                                        <span>{currentTime.toFixed(1)}s</span>
                                                        <span>{duration.toFixed(1)}s</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
