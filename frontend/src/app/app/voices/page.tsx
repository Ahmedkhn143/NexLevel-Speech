'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Mic, Trash2, Play, Pause, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Voice {
    id: string;
    name: string;
    status: 'READY' | 'TRAINING' | 'FAILED';
    previewUrl?: string;
    createdAt: string;
}

export default function VoicesPage() {
    const [voices, setVoices] = useState<Voice[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);

    // Cloning State
    const [cloneName, setCloneName] = useState('');
    const [cloneFiles, setCloneFiles] = useState<File[]>([]);
    const [consentGiven, setConsentGiven] = useState(false);
    const [isCloning, setIsCloning] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Audio Playback
    const [playingVoice, setPlayingVoice] = useState<string | null>(null);
    const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

    useEffect(() => {
        fetchVoices();
        return () => {
            if (audioElement) audioElement.pause();
        };
    }, []);

    const fetchVoices = async () => {
        try {
            const { data } = await api.get('/voice');
            setVoices(data.data || []);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load voices');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setCloneFiles(Array.from(e.target.files));
        }
    };

    const handleClone = async () => {
        if (!cloneName || cloneFiles.length === 0 || !consentGiven) return;

        setIsCloning(true);
        setUploadProgress(10); // Start progress

        const formData = new FormData();
        formData.append('name', cloneName);
        formData.append('description', 'Cloned via Dashboard');
        formData.append('consentGiven', 'true');
        cloneFiles.forEach(file => formData.append('files', file));

        try {
            // Simulated upload progress
            const interval = setInterval(() => {
                setUploadProgress(prev => Math.min(prev + 10, 90));
            }, 500);

            await api.post('/voice/clone', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            clearInterval(interval);
            setUploadProgress(100);

            toast.success('Voice cloning started!');
            setIsCloneModalOpen(false);
            setCloneName('');
            setCloneFiles([]);
            setConsentGiven(false);
            fetchVoices(); // Refresh list
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to clone voice');
        } finally {
            setIsCloning(false);
            setUploadProgress(0);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this voice?')) return;
        try {
            await api.delete(`/voice/${id}`);
            setVoices(voices.filter(v => v.id !== id));
            toast.success('Voice deleted');
        } catch (error) {
            toast.error('Failed to delete voice');
        }
    };

    const togglePlay = (url: string | undefined, id: string) => {
        if (!url) return;

        if (playingVoice === id) {
            audioElement?.pause();
            setPlayingVoice(null);
        } else {
            if (audioElement) audioElement.pause();
            const audio = new Audio(url);
            audio.onended = () => setPlayingVoice(null);
            audio.play();
            setAudioElement(audio);
            setPlayingVoice(id);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Voice Lab</h1>
                    <p className="text-muted-foreground mt-2">Manage your AI voice clones.</p>
                </div>
                <Button onClick={() => setIsCloneModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
                    New Voice Clone
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => (
                        <Card key={i} className="h-48">
                            <Skeleton className="w-12 h-12 rounded-full mb-4" />
                            <Skeleton className="w-3/4 h-6 mb-2" />
                            <Skeleton className="w-1/2 h-4" />
                        </Card>
                    ))
                ) : voices.length > 0 ? (
                    voices.map(voice => (
                        <Card key={voice.id} hover glass className="group relative">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${voice.status === 'READY' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                                    }`}>
                                    <Mic className="w-6 h-6" />
                                </div>
                                <div className={`px-2 py-1 rounded-full text-xs font-medium border ${voice.status === 'READY' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
                                    }`}>
                                    {voice.status}
                                </div>
                            </div>

                            <h3 className="text-lg font-bold mb-1">{voice.name}</h3>
                            <p className="text-sm text-muted-foreground mb-4">Created {new Date(voice.createdAt).toLocaleDateString()}</p>

                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="flex-1"
                                    onClick={() => togglePlay(voice.previewUrl, voice.id)}
                                    disabled={!voice.previewUrl}
                                >
                                    {playingVoice === voice.id ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                                    Preview
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-500 hover:bg-red-500/10 hover:text-red-600"
                                    onClick={() => handleDelete(voice.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center bg-card rounded-2xl border border-dashed border-border">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mic className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No voices yet</h3>
                        <p className="text-muted-foreground mb-6">Clone your first voice to get started.</p>
                        <Button onClick={() => setIsCloneModalOpen(true)}>Create Voice Clone</Button>
                    </div>
                )}
            </div>

            {/* Cloning Modal */}
            <Modal
                isOpen={isCloneModalOpen}
                onClose={() => !isCloning && setIsCloneModalOpen(false)}
                title="Clone New Voice"
                footer={
                    <div className="flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setIsCloneModalOpen(false)} disabled={isCloning}>Cancel</Button>
                        <Button onClick={handleClone} loading={isCloning} disabled={!cloneName || cloneFiles.length === 0 || !consentGiven}>
                            {isCloning ? `Cloning ${uploadProgress}%` : 'Clone Voice'}
                        </Button>
                    </div>
                }
            >
                <div className="space-y-6">
                    <Input
                        label="Voice Name"
                        placeholder="e.g. CEO Voice"
                        value={cloneName}
                        onChange={(e) => setCloneName(e.target.value)}
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Voice Samples</label>
                        <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:bg-muted/50 transition-colors relative">
                            <input
                                type="file"
                                multiple
                                accept="audio/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm font-medium">Click directly here to upload audio</p>
                            <p className="text-xs text-muted-foreground mt-1">MP3, WAV up to 10MB</p>
                            {cloneFiles.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                                    {cloneFiles.map((f, i) => (
                                        <span key={i} className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-md">
                                            {f.name}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl border border-border">
                        <div className="pt-0.5">
                            <input
                                type="checkbox"
                                id="consent"
                                checked={consentGiven}
                                onChange={(e) => setConsentGiven(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-primary focus:ring-primary"
                            />
                        </div>
                        <label htmlFor="consent" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                            I verify that I have all necessary rights and proper consent to clone this voice. I understand that cloning voices without consent is prohibited.
                        </label>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
