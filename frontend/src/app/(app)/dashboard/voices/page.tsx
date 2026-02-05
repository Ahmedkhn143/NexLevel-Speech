'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Mic, Trash2, Play, MoreVertical, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageHeader, EmptyState, ErrorState } from '@/components/shared';
import { voiceApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface Voice {
  id: string;
  name: string;
  description?: string;
  status: 'PROCESSING' | 'READY' | 'FAILED';
  createdAt: string;
}

export default function VoicesPage() {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVoices = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data } = await voiceApi.getVoices();
      setVoices(data || []);
    } catch (err) {
      setError('Failed to load voices. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVoices();
  }, []);

  const handleDelete = async (voiceId: string) => {
    if (!confirm('Are you sure you want to delete this voice?')) return;

    try {
      await voiceApi.deleteVoice(voiceId);
      setVoices((prev) => prev.filter((v) => v.id !== voiceId));
      toast.success('Voice deleted successfully');
    } catch (err) {
      toast.error('Failed to delete voice');
    }
  };

  const getStatusBadge = (status: Voice['status']) => {
    const styles = {
      READY: 'bg-green-500/10 text-green-400 border-green-500/20',
      PROCESSING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      FAILED: 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    return styles[status] || styles.PROCESSING;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Voices"
        description="Manage your cloned AI voices"
        actions={
          <Link href="/dashboard/voices/clone">
            <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
              Clone New Voice
            </Button>
          </Link>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-24 mb-2" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-9 flex-1" />
                <Skeleton className="h-9 w-9" />
              </div>
            </Card>
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchVoices} />
      ) : voices.length === 0 ? (
        <Card>
          <EmptyState
            icon={Mic}
            title="No voices yet"
            description="Clone your first voice to start generating personalized audio."
            action={
              <Link href="/dashboard/voices/clone">
                <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
                  Clone Your First Voice
                </Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {voices.map((voice, index) => (
            <motion.div
              key={voice.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-5 space-y-4 hover:border-primary/20 transition-colors group">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <Mic className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{voice.name}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${getStatusBadge(voice.status)}`}>
                        {voice.status === 'PROCESSING' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse mr-1.5" />
                        )}
                        {voice.status}
                      </span>
                    </div>
                  </div>
                </div>

                {voice.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {voice.description}
                  </p>
                )}

                <div className="text-xs text-muted-foreground">
                  Created {new Date(voice.createdAt).toLocaleDateString()}
                </div>

                <div className="flex gap-2">
                  {voice.status === 'READY' ? (
                    <Link href={`/dashboard/generate?voice=${voice.id}`} className="flex-1">
                      <Button variant="secondary" size="sm" className="w-full" icon={<Play className="w-4 h-4" />}>
                        Use Voice
                      </Button>
                    </Link>
                  ) : voice.status === 'FAILED' ? (
                    <Button variant="secondary" size="sm" className="flex-1" disabled>
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Failed
                    </Button>
                  ) : (
                    <Button variant="secondary" size="sm" className="flex-1" disabled>
                      Processing...
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(voice.id)}
                    className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
