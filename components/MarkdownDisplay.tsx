
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import type { Components } from 'react-markdown';

interface MarkdownDisplayProps {
  content: string;
}

const customRenderers: Components = {
  h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mt-6 mb-4 pb-2 border-b border-slate-300 dark:border-slate-600" {...props} />,
  h2: ({ node, ...props }) => <h2 className="text-2xl font-semibold mt-5 mb-3 pb-2 border-b border-slate-300 dark:border-slate-600" {...props} />,
  h3: ({ node, ...props }) => <h3 className="text-xl font-semibold mt-4 mb-2" {...props} />,
  p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
  ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4 pl-4" {...props} />,
  ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4 pl-4" {...props} />,
  li: ({ node, ...props }) => <li className="mb-2" {...props} />,
  blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-slate-400 dark:border-slate-500 pl-4 italic my-4 text-slate-600 dark:text-slate-300" {...props} />,
  code: ({ node, inline, className, children, ...props }) => {
    return !inline ? (
      <pre className="bg-slate-200 dark:bg-slate-800 p-4 rounded-md overflow-x-auto my-4">
        <code className={`font-mono text-sm ${className}`} {...props}>
          {children}
        </code>
      </pre>
    ) : (
      <code className="bg-slate-200 dark:bg-slate-700 text-red-500 dark:text-red-400 rounded px-1 py-0.5 font-mono text-sm" {...props}>
        {children}
      </code>
    );
  },
  table: ({ node, ...props }) => <div className="overflow-x-auto my-4"><table className="w-full text-left border-collapse" {...props} /></div>,
  thead: ({ node, ...props }) => <thead className="bg-slate-200 dark:bg-slate-800" {...props} />,
  th: ({ node, ...props }) => <th className="border border-slate-300 dark:border-slate-600 px-4 py-2" {...props} />,
  td: ({ node, ...props }) => <td className="border border-slate-300 dark:border-slate-600 px-4 py-2" {...props} />,
  a: ({ node, ...props }) => <a className="text-sky-600 dark:text-sky-400 hover:underline" {...props} />,
};

const MarkdownDisplay: React.FC<MarkdownDisplayProps> = ({ content }) => {
  return (
    <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 p-6 sm:p-8 rounded-lg shadow-lg w-full">
      <ReactMarkdown
        components={customRenderers}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeKatex]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownDisplay;
