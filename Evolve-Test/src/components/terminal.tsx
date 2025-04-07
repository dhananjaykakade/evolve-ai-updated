'use client';

import { useEffect, useRef } from 'react';

interface TerminalProps {
  output: string[];
  error?: string[];
  command?: string;
  onCommandChange?: (cmd: string) => void;
  onExecute?: (cmd: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  endRef?: React.RefObject<HTMLDivElement>;
  isExecuting?: boolean;
}

export function Terminal({ 
  output = [], 
  error = [], 
  command = '', 
  onCommandChange, 
  onExecute, 
  onKeyDown,
  isExecuting = false
}: TerminalProps) {
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when output changes
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output, error]);

  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Clean and normalize terminal output
  const cleanTerminalOutput = (text: string) => {
    if (!text) return text;
    // Remove ANSI escape codes
    text = text.replace(/\x1B\[[0-9;]*[mGKH]/g, '');
    // Remove other control characters but keep newlines
    return text.replace(/[\x00-\x09\x0B-\x1F\x7F-\x9F]/g, '');
  };

  // Combine all output and errors with type indicators
  const allLines = [
    ...output.map(text => ({ 
      text: cleanTerminalOutput(text), 
      type: 'output' as const 
    })),
    ...error.map(text => ({ 
      text: cleanTerminalOutput(text), 
      type: 'error' as const 
    }))
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && command.trim()) {
      onExecute?.(command);
    }
    onKeyDown?.(e);
  };

  return (
    <div className="h-full flex flex-col bg-black text-green-400 font-mono text-sm overflow-hidden">
      {/* Terminal output area */}
      <div className="flex-1 overflow-auto p-3 space-y-1">
        {allLines.map((line, i) => (
          <div 
            key={i} 
            className={
              line.type === 'error' ? 'text-red-400' : 
              line.text.startsWith('$ ') ? 'text-yellow-400' : 'text-green-400'
            }
            style={{ whiteSpace: 'pre-wrap' }}
          >
            {line.text}
          </div>
        ))}
        {isExecuting && (
          <div className="text-gray-400">Executing command...</div>
        )}
        <div ref={endRef} />
      </div>

      {/* Command input area */}
      {onCommandChange && (
        <div className="border-t border-gray-700 p-2 flex items-center">
          <span className="text-yellow-400 mr-2">$</span>
          <input
            ref={inputRef}
            type="text"
            value={command}
            onChange={(e) => onCommandChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-white caret-green-400"
            placeholder="Enter command..."
            aria-label="Terminal input"
            disabled={isExecuting}
          />
          {onExecute && (
            <button
              onClick={() => onExecute(command)}
              className="ml-2 px-3 py-1 bg-gray-700 rounded text-white hover:bg-gray-600 disabled:opacity-50"
              disabled={!command.trim() || isExecuting}
            >
              {isExecuting ? '...' : 'Run'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
