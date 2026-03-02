import React from 'react';
import type { ConversionHistoryItem } from '../App';

interface HistoryListProps {
  history: ConversionHistoryItem[];
  activeId: string | null;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ history, activeId, onView, onDelete, onClearAll }) => {
  if (history.length === 0) {
    return null;
  }

  const handleDownload = (fileName: string, markdown: string) => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const baseName = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
    a.download = `${baseName}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-lg shadow-lg w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Conversion History</h2>
        <button
          onClick={onClearAll}
          className="bg-red-500 text-white text-sm font-semibold py-1 px-3 rounded-md hover:bg-red-600 transition-colors duration-200"
          aria-label="Clear all conversion history"
        >
          Clear All
        </button>
      </div>
      <ul className="space-y-2 max-h-60 overflow-y-auto">
        {history.map((item) => (
          <li
            key={item.id}
            className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
              item.id === activeId
                ? 'bg-sky-100 dark:bg-sky-800'
                : 'hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            onClick={() => onView(item.id)}
          >
            <span
              className="flex-grow truncate pr-4"
              title={item.fileName}
            >
              {item.fileName}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(item.fileName, item.markdown);
                }}
                className="p-1.5 rounded-md hover:bg-sky-200 dark:hover:bg-sky-700 text-slate-600 dark:text-slate-300 hover:text-sky-700 dark:hover:text-sky-300"
                aria-label={`Download ${item.fileName} as Markdown`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent li's onClick from firing
                  onDelete(item.id);
                }}
                className="p-1.5 rounded-md hover:bg-red-200 dark:hover:bg-red-800 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                aria-label={`Delete ${item.fileName}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default HistoryList;