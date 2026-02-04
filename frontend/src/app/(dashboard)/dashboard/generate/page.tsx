'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import {
    Play,
    Pause,
    Download,
    Loader2,
    Volume2,
    AlertCircle,
    ChevronDown,
    Globe,
} from 'lucide-react';
import { voiceApi, ttsApi } from '@/lib/api';
import { Voice } from '@/types';
import { useAuthStore } from '@/stores';

const languages = [
    { code: 'en', name: 'English' },
    { code: 'ur', name: 'Urdu' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ar', name: 'Arabic' },
    { code: 'zh', name: 'Chinese' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'tr', name: 'Turkish' },
    { code: 'vi', name: 'Vietnamese' },
    { code: 'it', name: 'Italian' },
];

export default function GeneratePage() {
    const searchParams = useSearchParams();
    const { user } = useAuthStore();
    const audioRef = useRef<HTMLAudioElement>(null);

    const [voices, setVoices] = useState<Voice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<string>('');
    const [text, setText] = useState('');
    const [language, setLanguage] = useState('en');
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const charCount = text.length;
    const availableCredits = user?.credits
        ? user.credits.totalCredits - user.credits.usedCredits + user.credits.bonusCredits
        : 0;

    useEffect(() => {
        loadVoices();
    }, []);

    useEffect(() => {
        const voiceId = searchParams.get('voice');
        if (voiceId) {
            setSelectedVoice(voiceId);
        }
    }, [searchParams]);

    const PRESET_VOICES: Voice[] = [
        { id: 'pre_rachel', name: 'Rachel (American, Calm)', status: 'READY', externalVoiceId: '21m00Tcm4TlvDq8ikWAM', userId: 'SYSTEM' } as any,
        { id: 'pre_drew', name: 'Drew (American, News)', status: 'READY', externalVoiceId: '29vD33N1CtxCmqQRPOHJ', userId: 'SYSTEM' } as any,
        { id: 'pre_clyde', name: 'Clyde (American, Deep)', status: 'READY', externalVoiceId: '2EiwWnXFnvU5JabPnv8n', userId: 'SYSTEM' } as any,
        { id: 'pre_mimi', name: 'Mimi (Australian, Child)', status: 'READY', externalVoiceId: 'zrHiDhphv9ZnVXBqCLjz', userId: 'SYSTEM' } as any,
    ];

    const loadVoices = async () => {
        setLoading(true);
        try {
            const { data } = await voiceApi.getVoices();
            const readyVoices = data.filter((v: Voice) => v.status === 'READY');

            const allVoices = [...PRESET_VOICES, ...readyVoices];
            setVoices(allVoices);

            if (allVoices.length > 0 && !selectedVoice) {
                setSelectedVoice(allVoices[0].id);
            }
        } catch (err) {
            console.error('Failed to load voices:', err);
            // Fallback to presets
            setVoices(PRESET_VOICES);
            if (!selectedVoice) setSelectedVoice(PRESET_VOICES[0].id);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!selectedVoice || !text.trim()) {
            setError('Please select a voice and enter some text');
            return;
        }

        if (charCount > availableCredits) {
            setError('Insufficient credits. Please upgrade your plan.');
            return;
        }

        setGenerating(true);
        setError('');
        setAudioUrl(null);

        try {
            const { data } = await ttsApi.generate({
                voiceId: selectedVoice,
                text: text.trim(),
                language,
            });

            setAudioUrl(data.audioUrl);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to generate speech');
        } finally {
            setGenerating(false);
        }
    };

    const togglePlayback = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleDownload = () => {
        if (!audioUrl) return;
        const a = document.createElement('a');
        a.href = audioUrl;
        a.download = 'nexlevel-speech.mp3';
        a.click();
    };

    return (
        <div className="max-w-3xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold mb-2">Generate Speech</h1>
                <p className="text-gray-400">
                    Convert text to natural-sounding speech using your cloned voices
                </p>
            </motion.div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            ) : voices.length === 0 ? (
                <div className="card text-center py-12">
                    <Volume2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No voices available</h3>
                    <p className="text-gray-400">Create a voice clone first to start generating speech</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Voice & Language Selection */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="grid sm:grid-cols-2 gap-4"
                    >
                        {/* Voice Selector */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Voice</label>
                            <div className="relative">
                                <select
                                    value={selectedVoice}
                                    onChange={(e) => setSelectedVoice(e.target.value)}
                                    className="input appearance-none cursor-pointer pr-10"
                                >
                                    {voices.map((voice) => (
                                        <option key={voice.id} value={voice.id}>
                                            {voice.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                            </div>
                        </div>

                        {/* Language Selector */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Language</label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="input appearance-none cursor-pointer pl-10 pr-10"
                                >
                                    {languages.map((lang) => (
                                        <option key={lang.code} value={lang.code}>
                                            {lang.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Text Input */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <label className="block text-sm font-medium mb-2">Text to speak</label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value.slice(0, 100000))}
                            placeholder="Enter the text you want to convert to speech..."
                            className="input min-h-[200px] resize-y"
                            maxLength={100000}
                        />
                        <div className="flex items-center justify-between mt-2 text-sm">
                            <span className="text-gray-500">
                                {charCount.toLocaleString()} characters
                            </span>
                            <span
                                className={`${charCount > availableCredits ? 'text-red-400' : 'text-gray-500'
                                    }`}
                            >
                                {availableCredits.toLocaleString()} credits available
                            </span>
                        </div>
                    </motion.div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Generate Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <button
                            onClick={handleGenerate}
                            disabled={generating || !text.trim() || charCount > availableCredits}
                            className="btn-primary w-full py-4 disabled:opacity-50"
                        >
                            {generating ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Volume2 className="w-5 h-5" />
                                    Generate Speech ({charCount.toLocaleString()} credits)
                                </>
                            )}
                        </button>
                    </motion.div>

                    {/* Audio Player */}
                    {audioUrl && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="card bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30"
                        >
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={togglePlayback}
                                    className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center hover:scale-105 transition-transform"
                                >
                                    {isPlaying ? (
                                        <Pause className="w-6 h-6 text-white" />
                                    ) : (
                                        <Play className="w-6 h-6 text-white ml-1" />
                                    )}
                                </button>

                                <div className="flex-1">
                                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                            initial={{ width: 0 }}
                                            animate={{ width: isPlaying ? '100%' : '0%' }}
                                            transition={{ duration: 10 }}
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleDownload}
                                    className="btn-secondary py-2 px-4"
                                >
                                    <Download className="w-4 h-4" />
                                    Download
                                </button>
                            </div>

                            <audio
                                ref={audioRef}
                                src={audioUrl}
                                onEnded={() => setIsPlaying(false)}
                                className="hidden"
                            />
                        </motion.div>
                    )}
                </div>
            )}
        </div>
    );
}
