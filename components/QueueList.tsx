import React from 'react';
import type { QueueItem } from '../App';

const InlineSpinner: React.FC = () => (
  <svg className="animate-spin h-4 w-4 text-sky-600 dark:text-sky-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);


const StatusBadge: React.FC<{ status: QueueItem['status'] }> = ({ status }) => {
  switch (status) {
    case 'queued':
      return <span className="text-xs font-medium bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300 py-1 px-2 rounded-full">Queued</span>;
    case 'processing':
      return <span className="flex items-center gap-2 text-xs font-medium bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300 py-1 px-2 rounded-full"><InlineSpinner /> Processing</span>;
    case 'completed':
      return <span className="text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 py-1 px-2 rounded-full">Done</span>;
    case 'error':
      return <span className="text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 py-1 px-2 rounded-full">Failed</span>;
    default:
      return null;
  }
};

interface QueueListProps {
  queue: QueueItem[];
  onRemove: (id: string) => void;
  isProcessing: boolean;
}

const QueueList: React.FC<QueueListProps> = ({ queue, onRemove, isProcessing }) => {
  if (queue.length === 0) {
    return null;
  }

  return (
    <section className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-lg shadow-lg w-full">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Conversion Queue</h2>
      <ul className="space-y-2 max-h-60 overflow-y-auto">
        {queue.map((item) => (
          <li
            key={item.id}
            className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50"
          >
            <div className="flex flex-col flex-grow truncate pr-4">
              <span className="font-medium truncate" title={item.file.name}>{item.file.name}</span>
              {item.status === 'error' && item.error && (
                <span className="text-xs text-red-500 truncate" title={item.error}>{item.error}</span>
              )}
            </div>
            <div className="flex items-center gap-4">
                <StatusBadge status={item.status} />
                <button
                onClick={() => onRemove(item.id)}
                disabled={isProcessing && (item.status === 'processing' || item.status === 'completed')}
                className="p-1 rounded-full hover:bg-red-200 dark:hover:bg-red-800 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={`Remove ${item.file.name} from queue`}
                >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default QueueList;