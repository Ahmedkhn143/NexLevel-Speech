'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Play, Download, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageHeader, EmptyState, ErrorState } from '@/components/shared';
import { ttsApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface Generation {
  id: string;
  text: string;
  createdAt: string;
  voice: { id: string; name: string };
  duration: number;
  audioUrl?: string;
  characterCount: number;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
}

export default function HistoryPage() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchHistory = async (pageNum: number = 1) => {
    try {
      if (pageNum === 1) setIsLoading(true);
      setError(null);
      const { data } = await ttsApi.getHistory(pageNum, 20);
      
      if (pageNum === 1) {
        setGenerations(data.data || []);
      } else {
        setGenerations((prev) => [...prev, ...(data.data || [])]);
      }
      
      setHasMore(data.pagination?.page < data.pagination?.totalPages);
    } catch (err) {
      setError('Failed to load history. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDownload = (audioUrl: string, id: string) => {
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `nexlevel-${id}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Generation History"
        description="View and manage your past audio generations"
      />

      {isLoading ? (
        <Card className="p-0 overflow-hidden">
          <div className="divide-y divide-border">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
            ))}
          </div>
        </Card>
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchHistory(1)} />
      ) : generations.length === 0 ? (
        <Card>
          <EmptyState
            icon={Clock}
            title="No generations yet"
            description="Your audio generation history will appear here."
          />
        </Card>
      ) : (
        <>
          <Card className="p-0 overflow-hidden">
            <div className="divide-y divide-border">
              {generations.map((gen, index) => (
                <motion.div
                  key={gen.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors group"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    gen.status === 'COMPLETED' 
                      ? 'bg-primary/10 text-primary' 
                      : gen.status === 'FAILED'
                      ? 'bg-red-500/10 text-red-400'
                      : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {gen.status === 'COMPLETED' ? (
                      <Play className="w-4 h-4 ml-0.5" />
                    ) : gen.status === 'PROCESSING' ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="text-xs">!</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate pr-4">{gen.text}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5 flex-wrap">
                      <span>{gen.voice?.name || 'Unknown Voice'}</span>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                      <span>{new Date(gen.createdAt).toLocaleDateString()}</span>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                      <span>{gen.characterCount?.toLocaleString()} chars</span>
                      {gen.duration && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                          <span>{gen.duration.toFixed(1)}s</span>
                        </>
                      )}
                    </p>
                  </div>

                  {gen.status === 'COMPLETED' && gen.audioUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(gen.audioUrl!, gen.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      icon={<Download className="w-4 h-4" />}
                    >
                      <span className="hidden sm:inline">Download</span>
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>
          </Card>

          {hasMore && (
            <div className="text-center">
              <Button
                variant="secondary"
                onClick={() => {
                  setPage((p) => p + 1);
                  fetchHistory(page + 1);
                }}
              >
                Load More
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
