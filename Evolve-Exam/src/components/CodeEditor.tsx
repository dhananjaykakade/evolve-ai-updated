
import React, { useState } from 'react';
import { useTest } from '@/contexts/TestContext';

interface CodeEditorProps {
  initialValue: string;
  language: string;
  onChange: (code: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ language,initialValue, onChange }) => {
  // We're using a simple textarea for the code editor
  // In a production app, you might want to use Monaco Editor or CodeMirror
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };
  
  return (
    <div className="relative h-full">
      <textarea
        className="w-full h-full min-h-[300px] font-mono text-sm p-4 bg-gray-900 text-gray-100 rounded-md 
                  resize-none focus:outline-none focus:ring-1 focus:ring-test-teal"
        value={initialValue}
        onChange={handleChange}
        spellCheck={false}
      />
      <div className="absolute top-2 right-2 text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
        {language}
      </div>
    </div>
  );
};

export default CodeEditor;
