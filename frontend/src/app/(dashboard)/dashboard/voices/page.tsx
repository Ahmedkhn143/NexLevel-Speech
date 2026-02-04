'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plus, Mic, Play, Trash2, Loader2 } from 'lucide-react';
import { voiceApi } from '@/lib/api';
import { Voice } from '@/types';

export default function VoicesPage() {
    const [voices, setVoices] = useState<Voice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadVoices();
    }, []);

    const loadVoices = async () => {
        try {
            const { data } = await voiceApi.getVoices();
            setVoices(data);
        } catch (error) {
            console.error('Failed to load voices:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this voice?')) return;

        try {
            await voiceApi.deleteVoice(id);
            setVoices((prev) => prev.filter((v) => v.id !== id));
        } catch (error) {
            console.error('Failed to delete voice:', error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between mb-8"
            >
                <div>
                    <h1 className="text-3xl font-bold mb-2">My Voices</h1>
                    <p className="text-gray-400">Manage your AI voice clones</p>
                </div>
                <Link href="/dashboard/voices/clone" className="btn-primary">
                    <Plus className="w-5 h-5" />
                    Clone New Voice
                </Link>
            </motion.div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            ) : voices.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="card text-center py-16"
                >
                    <Mic className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No voices yet</h3>
                    <p className="text-gray-400 mb-6">
                        Create your first AI voice clone to get started
                    </p>
                    <Link href="/dashboard/voices/clone" className="btn-primary inline-flex">
                        <Plus className="w-5 h-5" />
                        Clone Your First Voice
                    </Link>
                </motion.div>
            ) : (
                <div className="grid gap-4">
                    {voices.map((voice, index) => (
                        <motion.div
                            key={voice.id}
                            className="card flex items-center gap-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 p-0.5 flex-shrink-0">
                                <div className="w-full h-full rounded-xl bg-gray-900 flex items-center justify-center">
                                    <Mic className="w-7 h-7 text-white" />
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold truncate">{voice.name}</h3>
                                <p className="text-sm text-gray-400 truncate">
                                    {voice.description || 'No description'}
                                </p>
                                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                    <span
                                        className={`px-2 py-0.5 rounded-full ${voice.status === 'READY'
                                                ? 'bg-green-500/20 text-green-400'
                                                : voice.status === 'PROCESSING'
                                                    ? 'bg-yellow-500/20 text-yellow-400'
                                                    : 'bg-red-500/20 text-red-400'
                                            }`}
                                    >
                                        {voice.status}
                                    </span>
                                    <span>
                                        Created {new Date(voice.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {voice.status === 'READY' && (
                                    <Link
                                        href={`/dashboard/generate?voice=${voice.id}`}
                                        className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                                    >
                                        <Play className="w-5 h-5" />
                                    </Link>
                                )}
                                <button
                                    onClick={() => handleDelete(voice.id)}
                                    className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
