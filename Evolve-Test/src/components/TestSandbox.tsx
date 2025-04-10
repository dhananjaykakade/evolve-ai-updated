
import React, { useState, useEffect } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTest } from '@/contexts/TestContext';
import { toast } from 'sonner';
import FileExplorer, { FileSystemItem, FileType } from './FileExplorer';
import CodeEditor from './CodeEditor';
import LivePreview from './LivePreview';
import {EvaluationPortal} from './ApiTester';
import { createDefaultFiles, findFileById, extractPreviewContent, updateFileContent } from '@/utils/sandboxUtils';

interface TestSandboxProps {
  testType: 'frontend' | 'backend' | 'fullstack';
  testTitle: string;
  testDescription: string;
}

const TestSandbox: React.FC<TestSandboxProps> = ({ 
  testType, 
  testTitle,
  testDescription 
}) => {
  const { submitTest } = useTest();
  const [files, setFiles] = useState<FileSystemItem[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null);
  const [previewContent, setPreviewContent] = useState({ html: '', css: '', js: '' });
  
  // Initialize files based on test type
  useEffect(() => {
    const defaultFiles = createDefaultFiles(testType);
    setFiles(defaultFiles);
    
    // Select first file by default
    if (defaultFiles.length > 0) {
      const firstFile = findFirstFile(defaultFiles);
      if (firstFile) {
        setSelectedFileId(firstFile.id);
        setSelectedFile(firstFile);
      }
    }
    
    // Extract preview content
    setPreviewContent(extractPreviewContent(defaultFiles));
  }, [testType]);
  
  // Find the first file in the file system (recursively)
  const findFirstFile = (items: FileSystemItem[]): FileType | null => {
    for (const item of items) {
      if (item.type === 'file') {
        return item as FileType;
      } else if (item.type === 'folder') {
        const found = findFirstFile((item as any).children);
        if (found) return found;
      }
    }
    return null;
  };
  
  // Handle file selection
  const handleSelectFile = (file: FileType) => {
    setSelectedFileId(file.id);
    setSelectedFile(file);
  };
  
  // Handle code changes
  const handleCodeChange = (newContent: string) => {
    if (!selectedFileId || !selectedFile) return;
    
    // Update file in state
    const updatedFiles = updateFileContent(files, selectedFileId, newContent);
    setFiles(updatedFiles);
    
    // Update selected file
    setSelectedFile({ ...selectedFile, content: newContent });
    
    // Update preview content if needed
    if (
      selectedFile.name.endsWith('.html') || 
      selectedFile.name.endsWith('.css') || 
      selectedFile.name.endsWith('.js')
    ) {
      setPreviewContent(extractPreviewContent(updatedFiles));
    }
  };
  
  // Handle file system changes
  const handleFilesChange = (newFiles: FileSystemItem[]) => {
    setFiles(newFiles);
    
    // Update preview content
    setPreviewContent(extractPreviewContent(newFiles));
    
    // If selected file was deleted, select another one
    if (selectedFileId) {
      const stillExists = findFileById(newFiles, selectedFileId);
      if (!stillExists) {
        const firstFile = findFirstFile(newFiles);
        if (firstFile) {
          setSelectedFileId(firstFile.id);
          setSelectedFile(firstFile);
        } else {
          setSelectedFileId(null);
          setSelectedFile(null);
        }
      }
    }
  };
  
  // Handle test submission
  const handleSubmitTest = () => {
    const confirmSubmit = window.confirm(
      "Are you sure you want to submit your solution? You cannot make changes after submission."
    );
    
    if (confirmSubmit) {
      toast.success("Test submitted successfully!");
      submitTest();
    }
  };
  
  // Base URL for API testing
  const apiBaseUrl = 'https://jsonplaceholder.typicode.com'; // Example API for testing

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      <Card className="mb-4 p-4">
        <h2 className="text-2xl font-bold">{testTitle}</h2>
        <p className="mt-2 whitespace-pre-line">{testDescription}</p>
      </Card>
      
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* File Explorer Panel */}
        <ResizablePanel defaultSize={20} minSize={15}>
          <FileExplorer 
            files={files} 
            onFilesChange={handleFilesChange}
            onSelectFile={handleSelectFile}
            selectedFileId={selectedFileId}
          />
        </ResizablePanel>
        
        <ResizableHandle />
        
        {/* Code Editor Panel */}
        <ResizablePanel defaultSize={40}>
          <Card className="h-full flex flex-col overflow-hidden border">
            <div className="p-3 border-b flex justify-between items-center bg-muted/30">
              <h3 className="font-medium truncate">
                {selectedFile ? selectedFile.name : 'Select a file'}
              </h3>
            </div>
            <div className="flex-1 overflow-hidden">
              {selectedFile ? (
                <CodeEditor 
                  value={selectedFile.content}
                  onChange={handleCodeChange}
                  language={selectedFile.language}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Select a file from the explorer to edit
                </div>
              )}
            </div>
          </Card>
        </ResizablePanel>
        
        <ResizableHandle />
        
        {/* Preview Panel */}
        <ResizablePanel defaultSize={40}>
          <Tabs defaultValue={testType === 'backend' ? 'api' : 'preview'} className="h-full flex flex-col">
            <div className="px-2 border-b">
              <TabsList className="h-10">
                <TabsTrigger value="preview" disabled={testType === 'backend'}>Preview</TabsTrigger>
                <TabsTrigger value="api">API Tester</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="preview" className="flex-1 p-0 pt-1">
              <LivePreview 
                html={previewContent.html}
                css={previewContent.css}
                js={previewContent.js}
              />
            </TabsContent>
            
            <TabsContent value="api" className="flex-1 p-0 pt-1">
              <ApiTester baseUrl={apiBaseUrl} />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
      
      <div className="mt-4 flex justify-end">
        <Button 
          onClick={handleSubmitTest}
          className="flex items-center gap-1"
        >
          <Send className="h-4 w-4" />
          <span>Submit Solution</span>
        </Button>
      </div>
    </div>
  );
};

export default TestSandbox;
