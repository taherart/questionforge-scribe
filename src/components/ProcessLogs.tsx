
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Trash2, RefreshCw, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from "@/integrations/supabase/client";

interface ProcessLog {
  timestamp: string;
  message: string;
  book_id?: string;
  level: 'info' | 'warn' | 'error';
}

const ProcessLogs = () => {
  const [logs, setLogs] = useState<ProcessLog[]>([]);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  const fetchLogs = async () => {
    try {
      // For demo purposes, we're creating mock logs
      // In a real implementation, you would fetch these from a logs table in Supabase
      const mockLogs: ProcessLog[] = [
        { timestamp: new Date().toISOString(), message: 'Scanning for new PDF files and using AI to extract metadata...', level: 'info' },
        { timestamp: new Date(Date.now() - 30000).toISOString(), message: 'AI analyzed textbook.pdf: Grade 8 Math, Semester 1', level: 'info' },
        { timestamp: new Date(Date.now() - 60000).toISOString(), message: 'Found new file: textbook.pdf', level: 'info' },
        { timestamp: new Date(Date.now() - 120000).toISOString(), message: 'Waiting for processing to be started manually', level: 'info' },
        { timestamp: new Date(Date.now() - 180000).toISOString(), message: 'To start question extraction, click the play button next to a book', level: 'warn' },
      ];
      
      setLogs(mockLogs);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  useEffect(() => {
    fetchLogs();
    
    // Set up auto refresh interval
    let interval: number | undefined;
    if (isAutoRefresh) {
      interval = window.setInterval(() => {
        fetchLogs();
      }, 5000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoRefresh]);

  const clearLogs = () => {
    setLogs([]);
  };

  const getLevelColor = (level: ProcessLog['level']) => {
    switch (level) {
      case 'info': return 'text-blue-500';
      case 'warn': return 'text-amber-500';
      case 'error': return 'text-red-500';
      default: return 'text-slate-500';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl flex items-center">
            <Terminal className="mr-2 h-5 w-5 text-primary" />
            Process Logs
          </CardTitle>
          <CardDescription className="flex items-center">
            Real-time logs of book processing activities
            <Sparkles className="ml-2 h-4 w-4 text-yellow-400" />
          </CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
            className={isAutoRefresh ? 'bg-primary/10' : ''}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isAutoRefresh ? 'animate-spin' : ''}`} />
            {isAutoRefresh ? 'Auto' : 'Manual'}
          </Button>
          <Button variant="outline" size="sm" onClick={clearLogs}>
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] rounded border p-4 bg-slate-50 dark:bg-slate-900">
          {logs.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No logs to display
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm font-mono"
                >
                  <span className="text-slate-500">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className={`ml-2 ${getLevelColor(log.level)}`}>
                    [{log.level.toUpperCase()}]
                  </span>
                  <span className="ml-2">{log.message}</span>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ProcessLogs;
