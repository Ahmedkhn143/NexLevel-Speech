'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Download, Search, Filter, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Generation {
    id: string;
    text: string;
    createdAt: string;
    voice: { name: string };
    duration: number;
    url?: string;
}

export default function HistoryPage() {
    const [history, setHistory] = useState<Generation[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const { data } = await api.get('/tts/history?limit=50');
                setHistory(data.data || []);
            } catch (error) {
                toast.error('Failed to load history');
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const filtered = history.filter(h =>
        h.text.toLowerCase().includes(search.toLowerCase()) ||
        h.voice.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Generation History</h1>
                    <p className="text-muted-foreground mt-2">View and download your past creations.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search text or voice..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <Card className="p-0 overflow-hidden bg-card/50 min-h-[500px]">
                {loading ? (
                    <div className="p-8 text-center text-muted-foreground">Loading history...</div>
                ) : filtered.length > 0 ? (
                    <div className="divide-y divide-border">
                        <div className="grid grid-cols-12 gap-4 p-4 text-xs font-medium text-muted-foreground bg-muted/30 uppercase tracking-wider">
                            <div className="col-span-5">Content</div>
                            <div className="col-span-2">Voice</div>
                            <div className="col-span-2">Date</div>
                            <div className="col-span-1">Duration</div>
                            <div className="col-span-2 text-right">Actions</div>
                        </div>
                        {filtered.map((item, i) => (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.05 }}
                                key={item.id}
                                className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/50 transition-colors group"
                            >
                                <div className="col-span-5 truncate text-sm font-medium text-white" title={item.text}>
                                    {item.text}
                                </div>
                                <div className="col-span-2 text-sm text-muted-foreground">
                                    {item.voice.name}
                                </div>
                                <div className="col-span-2 text-sm text-muted-foreground">
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </div>
                                <div className="col-span-1 text-sm text-muted-foreground">
                                    {item.duration.toFixed(1)}s
                                </div>
                                <div className="col-span-2 flex justify-end gap-2">
                                    <Button size="sm" variant="ghost" icon={<Play className="w-4 h-4" />}>
                                    </Button>
                                    <Button size="sm" variant="ghost" icon={<Download className="w-4 h-4" />}>
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center text-muted-foreground">
                        No history found matching your filters.
                    </div>
                )}
            </Card>
        </div>
    );
}
