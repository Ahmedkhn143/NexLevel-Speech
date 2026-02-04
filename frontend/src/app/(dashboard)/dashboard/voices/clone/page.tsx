'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';
import { Upload, X, Mic, AlertCircle, Check, Loader2 } from 'lucide-react';
import { voiceApi } from '@/lib/api';

export default function CloneVoicePage() {
    const router = useRouter();
    const [files, setFiles] = useState<File[]>([]);
    const [voiceName, setVoiceName] = useState('');
    const [description, setDescription] = useState('');
    const [consent, setConsent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (files.length + acceptedFiles.length > 5) {
            setError('Maximum 5 audio files allowed');
            return;
        }
        setFiles((prev) => [...prev, ...acceptedFiles.slice(0, 5 - prev.length)]);
        setError('');
    }, [files]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'audio/*': ['.mp3', '.wav', '.m4a', '.ogg', '.flac'],
        },
        maxSize: 20 * 1024 * 1024, // 20MB
    });

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (files.length < 2) {
            setError('Please upload at least 2 audio samples');
            return;
        }

        if (!consent) {
            setError('Please confirm you have consent to clone this voice');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('name', voiceName);
            formData.append('description', description);
            files.forEach((file) => formData.append('samples', file));

            await voiceApi.cloneVoice(formData);
            router.push('/dashboard/voices');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to clone voice');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold mb-2">Clone a Voice</h1>
                <p className="text-gray-400">
                    Upload 2-5 audio samples to create an AI clone of any voice.
                </p>
            </motion.div>

            <form onSubmit={handleSubmit}>
                {/* Voice Name */}
                <motion.div
                    className="mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <label className="block text-sm font-medium mb-2">Voice Name *</label>
                    <input
                        type="text"
                        value={voiceName}
                        onChange={(e) => setVoiceName(e.target.value)}
                        placeholder="e.g., My Professional Voice"
                        className="input"
                        required
                    />
                </motion.div>

                {/* Description */}
                <motion.div
                    className="mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g., Deep male voice for narration"
                        className="input"
                    />
                </motion.div>

                {/* File Upload */}
                <motion.div
                    className="mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <label className="block text-sm font-medium mb-2">
                        Audio Samples (2-5 files required)
                    </label>
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
              ${isDragActive
                                ? 'border-blue-500 bg-blue-500/10'
                                : 'border-gray-700 hover:border-gray-600'
                            }`}
                    >
                        <input {...getInputProps()} />
                        <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400 mb-2">
                            Drag & drop audio files here, or click to browse
                        </p>
                        <p className="text-xs text-gray-500">
                            MP3, WAV, M4A, OGG, FLAC • Max 20MB per file
                        </p>
                    </div>

                    {/* Uploaded Files */}
                    {files.length > 0 && (
                        <div className="mt-4 space-y-2">
                            {files.map((file, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 bg-gray-800 rounded-lg px-4 py-3"
                                >
                                    <Mic className="w-5 h-5 text-blue-400 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm truncate">{file.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeFile(index)}
                                        className="p-1 hover:bg-gray-700 rounded"
                                    >
                                        <X className="w-4 h-4 text-gray-400" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Tips */}
                <motion.div
                    className="mb-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                >
                    <h4 className="font-medium mb-2 text-blue-400">Tips for best results:</h4>
                    <ul className="text-sm text-gray-400 space-y-1">
                        <li>• Use high-quality recordings with minimal background noise</li>
                        <li>• Include a variety of speaking styles and emotions</li>
                        <li>• Each sample should be 10-60 seconds long</li>
                        <li>• Speak clearly and at a natural pace</li>
                    </ul>
                </motion.div>

                {/* Consent */}
                <motion.div
                    className="mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={consent}
                            onChange={(e) => setConsent(e.target.checked)}
                            className="mt-1 w-4 h-4 rounded border-gray-600"
                        />
                        <span className="text-sm text-gray-400">
                            I confirm that I have the right to clone this voice. I have obtained
                            proper consent from the voice owner and will use the cloned voice
                            responsibly and in accordance with the{' '}
                            <a href="/terms" className="text-blue-400 hover:underline">
                                Terms of Service
                            </a>
                            .
                        </span>
                    </label>
                </motion.div>

                {/* Error */}
                {error && (
                    <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        {error}
                    </div>
                )}

                {/* Submit */}
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="btn-secondary flex-1"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || files.length < 2 || !voiceName || !consent}
                        className="btn-primary flex-1 disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Cloning Voice...
                            </>
                        ) : (
                            <>
                                <Check className="w-5 h-5" />
                                Clone Voice
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
