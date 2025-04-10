
import React, { useEffect, useRef } from 'react';
import { Textarea } from './ui/textarea';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange, language = 'javascript' }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && document.activeElement === textareaRef.current) {
        e.preventDefault();
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        // Insert tab at cursor position
        const newValue = value.substring(0, start) + '  ' + value.substring(end);
        onChange(newValue);

        // Move cursor after the inserted tab
        setTimeout(() => {
          if (textarea) {
            textarea.selectionStart = textarea.selectionEnd = start + 2;
          }
        }, 0);
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [value, onChange]);

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="font-mono text-sm h-full resize-none focus-visible:ring-0 focus-visible:ring-offset-0 border-0"
      spellCheck="false"
      placeholder={`// Write your ${language} code here...`}
    />
  );
};

export default CodeEditor;
