import React, { useState, useCallback, useEffect } from 'react';
import { convertPdfToMarkdown } from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';
import MarkdownDisplay from './components/MarkdownDisplay';
import Spinner from './components/Spinner';
import HistoryList from './components/HistoryList';
import QueueList from './components/QueueList';

export type ConversionHistoryItem = {
  id: string;
  fileName: string;
  markdown: string;
};

export type QueueItem = {
  id: string;
  file: File;
  status: 'queued' | 'processing' | 'completed' | 'error';
  error?: string;
};


const App: React.FC = () => {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isQueueProcessing, setIsQueueProcessing] = useState<boolean>(false);
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [conversionHistory, setConversionHistory] = useState<ConversionHistoryItem[]>([]);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('pdfConversionHistory');
      if (savedHistory) {
        setConversionHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error("Failed to load history from localStorage", error);
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      const validNewFiles = newFiles.filter(file => file.type === 'application/pdf');

      if (validNewFiles.length !== newFiles.length) {
        setError('Some files were not PDFs and were ignored.');
      } else {
        setError(null);
      }

      const newQueueItems: QueueItem[] = validNewFiles
        .filter(file => !queue.some(item => item.file.name === file.name && item.file.lastModified === file.lastModified))
        .map(file => ({
          id: `${file.name}-${file.lastModified}-${Math.random()}`,
          file,
          status: 'queued',
        }));

      if (newQueueItems.length > 0) {
        setQueue(prevQueue => [...prevQueue, ...newQueueItems]);
      }
      
      event.target.value = ''; // Allow selecting the same file again
    }
  };

  const handleStartQueue = () => {
    if (queue.some(item => item.status === 'queued') && !isQueueProcessing) {
      setIsQueueProcessing(true);
      setMarkdown(null);
      setActiveHistoryId(null);
    }
  };

  const handleRemoveFromQueue = (id: string) => {
    setQueue(prevQueue => prevQueue.filter(item => item.id !== id));
  };


  useEffect(() => {
    if (!isQueueProcessing) {
      return;
    }
    
    const currentlyProcessing = queue.find(item => item.status === 'processing');
    if (currentlyProcessing) {
      return; // Wait for the current item to finish
    }

    const nextItem = queue.find(item => item.status === 'queued');

    if (nextItem) {
      setQueue(prevQueue => prevQueue.map(item =>
        item.id === nextItem.id ? { ...item, status: 'processing' } : item
      ));

      (async () => {
        try {
          const base64String = await fileToBase64(nextItem.file);
          const result = await convertPdfToMarkdown(base64String);

          if (result.startsWith('Error:')) {
            throw new Error(result.substring(7));
          }

          setQueue(prevQueue => prevQueue.map(item =>
            item.id === nextItem.id ? { ...item, status: 'completed' } : item
          ));
          
          const newHistoryItem: ConversionHistoryItem = {
            id: Date.now().toString(),
            fileName: nextItem.file.name,
            markdown: result,
          };
          
          setConversionHistory(prevHistory => {
            const newHistory = [newHistoryItem, ...prevHistory];
            localStorage.setItem('pdfConversionHistory', JSON.stringify(newHistory));
            return newHistory;
          });

        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
          setQueue(prevQueue => prevQueue.map(item =>
            item.id === nextItem.id ? { ...item, status: 'error', error: errorMessage } : item
          ));
        }
      })();
    } else {
      setIsQueueProcessing(false); // All items processed
    }
  }, [isQueueProcessing, queue]);


  const handleViewHistoryItem = (id: string) => {
    const item = conversionHistory.find(i => i.id === id);
    if (item) {
      setMarkdown(item.markdown);
      setActiveHistoryId(id);
      setError(null);
    }
  };

  const handleDeleteHistoryItem = (id: string) => {
    const newHistory = conversionHistory.filter(i => i.id !== id);
    setConversionHistory(newHistory);
    try {
      localStorage.setItem('pdfConversionHistory', JSON.stringify(newHistory));
    } catch (e) {
      console.error("Failed to update history in localStorage", e);
    }

    if (activeHistoryId === id) {
      setMarkdown(null);
      setActiveHistoryId(null);
    }
  };

  const handleClearHistory = () => {
    setConversionHistory([]);
    try {
      localStorage.removeItem('pdfConversionHistory');
    } catch (e) {
      console.error("Failed to clear history from localStorage", e);
    }
    setMarkdown(null);
    setActiveHistoryId(null);
  };

  const queuedCount = queue.filter(q => q.status === 'queued').length;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans p-4 sm:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-8">
        <header className="text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-2">PDF to Markdown AI Converter</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Upload multiple PDFs and let AI transform them into beautifully formatted Markdown.
          </p>
        </header>

        <main className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-lg shadow-lg w-full">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <label
              htmlFor="pdf-upload"
              className="w-full sm:w-auto flex-grow cursor-pointer"
            >
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center hover:border-sky-500 dark:hover:border-sky-400 transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  {queue.length > 0 ? `${queue.length} file(s) in queue` : 'Click to upload or drag and drop PDFs'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500">PDFs only</p>
              </div>
              <input id="pdf-upload" type="file" className="hidden" accept="application/pdf" onChange={handleFileChange} multiple />
            </label>
            <button
              onClick={handleStartQueue}
              disabled={queuedCount === 0 || isQueueProcessing}
              className="w-full sm:w-auto shrink-0 bg-sky-600 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-sky-700 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 flex items-center justify-center gap-2"
            >
              {isQueueProcessing ? <Spinner /> : null}
              {isQueueProcessing ? 'Processing...' : `Convert (${queuedCount})`}
            </button>
          </div>
          {error && (
            <div className="mt-4 bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-400 dark:border-yellow-600 text-yellow-700 dark:text-yellow-300 px-4 py-3 rounded-lg" role="alert">
              <strong className="font-bold">Notice: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
        </main>

        {queue.length > 0 && (
          <QueueList
            queue={queue}
            onRemove={handleRemoveFromQueue}
            isProcessing={isQueueProcessing}
          />
        )}

        <HistoryList
          history={conversionHistory}
          activeId={activeHistoryId}
          onView={handleViewHistoryItem}
          onDelete={handleDeleteHistoryItem}
          onClearAll={handleClearHistory}
        />

        {activeHistoryId && markdown && (
          <MarkdownDisplay content={markdown} />
        )}

      </div>
    </div>
  );
};

export default App;