'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Upload, Mic, X, Play, Pause, AlertCircle, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageHeader } from '@/components/shared';
import { voiceApi } from '@/lib/api';
import toast from 'react-hot-toast';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FORMATS = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/m4a'];

export default function CloneVoicePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceName, setVoiceName] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback((selectedFile: File) => {
    setError(null);

    if (!ACCEPTED_FORMATS.includes(selectedFile.type)) {
      setError('Please upload an MP3, WAV, or M4A file');
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('File must be less than 10MB');
      return;
    }

    // Clean up previous audio URL
    if (audioUrl) URL.revokeObjectURL(audioUrl);

    setFile(selectedFile);
    setAudioUrl(URL.createObjectURL(selectedFile));
    setStep(2);
  }, [audioUrl]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFileSelect(droppedFile);
  }, [handleFileSelect]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSubmit = async () => {
    if (!file || !voiceName.trim()) {
      toast.error('Please provide a voice name');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', voiceName.trim());
      if (description.trim()) {
        formData.append('description', description.trim());
      }

      await voiceApi.cloneVoice(formData);
      
      setStep(3);
      toast.success('Voice clone started!');
      
      // Redirect after a delay
      setTimeout(() => {
        router.push('/dashboard/voices');
      }, 3000);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to clone voice. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setFile(null);
    setAudioUrl(null);
    setVoiceName('');
    setDescription('');
    setError(null);
    setStep(1);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/voices">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Clone a Voice"
        description="Upload a clear audio sample to create your custom AI voice"
      />

      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= s ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
            }`}>
              {step > s ? <CheckCircle className="w-4 h-4" /> : s}
            </div>
            {s < 3 && (
              <div className={`flex-1 h-0.5 mx-2 ${
                step > s ? 'bg-primary' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Upload */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-8">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-border rounded-2xl p-12 text-center hover:border-primary/50 transition-colors cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".mp3,.wav,.m4a"
                className="hidden"
                onChange={(e) => {
                  const selected = e.target.files?.[0];
                  if (selected) handleFileSelect(selected);
                }}
              />

              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <Upload className="w-8 h-8 text-primary" />
              </div>

              <h3 className="text-lg font-semibold mb-2">Upload Audio Sample</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                MP3, WAV, or M4A • Max 10MB • 30 seconds to 5 minutes recommended
              </p>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="mt-6 p-4 rounded-xl bg-muted/50">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Mic className="w-4 h-4 text-primary" />
                Tips for best results
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use clear, studio-quality audio if possible</li>
                <li>• Minimize background noise</li>
                <li>• 1-3 minutes of speech works best</li>
                <li>• Speak naturally at a consistent pace</li>
              </ul>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Step 2: Configure */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 space-y-6">
            {/* Audio Preview */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
              <button
                onClick={handlePlayPause}
                className="w-12 h-12 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-white" />
                ) : (
                  <Play className="w-5 h-5 text-white ml-0.5" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{file?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {file && (file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
              <audio
                ref={audioRef}
                src={audioUrl || ''}
                onEnded={() => setIsPlaying(false)}
              />
            </div>

            {/* Voice Details Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Voice Name *
                </label>
                <Input
                  value={voiceName}
                  onChange={(e) => setVoiceName(e.target.value)}
                  placeholder="e.g., Professional Narrator"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Description (optional)
                </label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Warm male voice for audiobooks"
                  maxLength={200}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="secondary" onClick={resetForm}>
                Back
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={isUploading || !voiceName.trim()}
                className="flex-1"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  'Clone Voice'
                )}
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Step 3: Success */}
      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Voice Clone Started!</h2>
            <p className="text-muted-foreground mb-6">
              Your voice is being processed. This usually takes 2-5 minutes.
              We'll notify you when it's ready.
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting to your voices...
            </p>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
