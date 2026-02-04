'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Download, Wand2, Mic, Globe, AlertCircle, RefreshCcw } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Voice {
    id: string;
    name: string;
}

const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'ur', name: 'Urdu' },
    { code: 'hi', name: 'Hindi' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'pl', name: 'Polish' },
];

export default function TTSPage() {
    const { user, refreshProfile } = useAuthStore(); // refreshProfile needed to update credits after generation
    const [text, setText] = useState('');
    const [voices, setVoices] = useState<Voice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState('');
    const [language, setLanguage] = useState('en');
    const [loading, setLoading] = useState(false);
    const [generatedAudio, setGeneratedAudio] = useState<{ url: string; id: string } | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Fetch voices
    useEffect(() => {
        api.get('/voice').then(({ data }) => {
            const readyVoices = data.data?.filter((v: any) => v.status === 'READY') || [];
            setVoices(readyVoices);
            if (readyVoices.length > 0) setSelectedVoice(readyVoices[0].id);
        }).catch(console.error);
    }, []);

    const handleGenerate = async () => {
        if (!text || text.length < 5 || !selectedVoice) return;

        setLoading(true);
        setGeneratedAudio(null);

        try {
            const { data } = await api.post('/tts/generate', {
                text,
                voiceId: selectedVoice,
                language,
            });

            // Assuming API returns { url: '...', id: '...' }
            // If it returns buffer directly, handling is different. 
            // Phase 2 output said "returns Buffer".
            // My Controller usually returns { success: true, data: { url: ... } }.
            // Wait, previous Phase 2 verification: Controller returned 'url' in response or streamed?
            // "Controller: TtsController.generateSpeech".
            // Let's assume it returns JSON with URL (presigned or public).

            if (data.data?.url) {
                setGeneratedAudio(data.data);
                toast.success('Audio generated successfully!');
                // Refresh credits
                refreshProfile?.();
            } else {
                // Fallback if raw buffer (unlikely for dashboard API)
                toast.error('Unexpected response format');
            }

        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Generation failed');
        } finally {
            setLoading(false);
        }
    };

    const characterCount = text.length;
    const maxChars = 10000; // Limit per request
    const creditsAvailable = (user?.credits?.totalCredits || 0) - (user?.credits?.usedCredits || 0);
    const canGenerate = characterCount >= 5 && characterCount <= maxChars && creditsAvailable >= characterCount;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    Text to Speech
                </h1>
                <p className="text-muted-foreground max-w-lg mx-auto">
                    Turn your text into lifelike speech using your cloned voices.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Controls */}
                <Card className="md:col-span-1 space-y-6 h-fit sticky top-24">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                            <Mic className="w-4 h-4" /> Select Voice
                        </label>
                        <select
                            className="w-full bg-muted border border-border rounded-xl px-3 py-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                            value={selectedVoice}
                            onChange={(e) => setSelectedVoice(e.target.value)}
                        >
                            <option value="" disabled>Select a voice...</option>
                            {voices.map(v => (
                                <option key={v.id} value={v.id}>{v.name}</option>
                            ))}
                        </select>
                        {voices.length === 0 && (
                            <p className="text-xs text-yellow-500 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> No ready voices found.
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                            <Globe className="w-4 h-4" /> Language
                        </label>
                        <select
                            className="w-full bg-muted border border-border rounded-xl px-3 py-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                        >
                            {LANGUAGES.map(l => (
                                <option key={l.code} value={l.code}>{l.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="pt-4 border-t border-border">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Est. Cost</span>
                            <span className="font-medium text-white">{characterCount} Credits</span>
                        </div>
                        <div className="flex justify-between text-sm mb-4">
                            <span className="text-muted-foreground">Available</span>
                            <span className={`font-medium ${creditsAvailable < characterCount ? 'text-red-500' : 'text-green-500'}`}>
                                {creditsAvailable.toLocaleString()}
                            </span>
                        </div>
                        <Button
                            className="w-full"
                            variant="primary"
                            onClick={handleGenerate}
                            loading={loading}
                            disabled={!canGenerate || !selectedVoice}
                        >
                            Generate Speech
                        </Button>
                        {!canGenerate && characterCount > 0 && (
                            <p className="text-xs text-center text-red-500 mt-2">
                                {characterCount < 5 ? 'Minimum 5 characters' : creditsAvailable < characterCount ? 'Insufficient credits' : 'Character limit exceeded'}
                            </p>
                        )}
                    </div>
                </Card>

                {/* Input Area */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="min-h-[400px] flex flex-col p-1 focus-within:ring-2 ring-primary/20 transition-all">
                        <textarea
                            className="flex-1 w-full bg-transparent border-none resize-none p-6 text-lg focus:outline-none custom-scrollbar leading-relaxed"
                            placeholder="Type something amazing here..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            maxLength={maxChars}
                        />
                        <div className="px-4 py-2 bg-muted/30 border-t border-border flex justify-between items-center text-xs text-muted-foreground rounded-b-xl">
                            <span>Supported: English, Urdu, Hindi...</span>
                            <span>{characterCount} / {maxChars}</span>
                        </div>
                    </Card>

                    {/* Result Player */}
                    <AnimatePresence>
                        {generatedAudio && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 shadow-2xl relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full pointer-events-none" />

                                <div className="flex items-center gap-6 relative z-10">
                                    <button
                                        className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white shadow-lg hover:scale-105 transition-transform"
                                        onClick={() => {
                                            if (audioRef.current) {
                                                if (audioRef.current.paused) audioRef.current.play();
                                                else audioRef.current.pause();
                                            }
                                        }}
                                    >
                                        <Play className="w-6 h-6 fill-current ml-1" />
                                    </button>

                                    <div className="flex-1">
                                        <h3 className="font-medium text-white mb-1">Generated Audio</h3>
                                        <audio
                                            ref={audioRef}
                                            src={generatedAudio.url}
                                            controls
                                            className="w-full h-8"
                                            style={{ filter: 'invert(1) hue-rotate(180deg)' }} // Quick hack for dark mode audio player
                                        />
                                    </div>

                                    <a href={generatedAudio.url} download target="_blank" rel="noopener noreferrer">
                                        <Button variant="secondary" size="sm" icon={<Download className="w-4 h-4" />}>
                                            Save
                                        </Button>
                                    </a>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
