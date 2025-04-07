'use client';

import { File, Folder, Tree } from "@/components/magicui/file-tree";
import { useState, useEffect } from "react";
import { apiService, fileService } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { FileIcon, FolderIcon, FolderOpenIcon, Plus, Trash2, Pencil } from "lucide-react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

interface FileStructure {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  content?: string;
  children?: FileStructure[];
}

export function FileExplorer({
  sessionId,
  initialFiles = [
    {
      id: '/app/server.js',
      name: 'server.js',
      type: 'file',
      path: '/app/server.js',
      content: `const express = require('express');\nconst app = express();\nconst port = process.env.PORT || 3000;\n\napp.use(express.json());\n\napp.get('/', (req, res) => {\n  res.send('Hello from Node.js server!');\n});\n\napp.listen(port, () => {\n  console.log(\`Server running at http://localhost:\${port}\`);\n});`
    },
    {
      id: '/app/package.json',
      name: 'package.json',
      type: 'file',
      path: '/app/package.json',
      content: `{\n  "name": "node-server",\n  "version": "1.0.0",\n  "main": "server.js",\n  "dependencies": {\n    "express": "^4.18.2",\n    "cors": "^2.8.5"\n  }\n}`
    }
  ],
  onFileSelect,
}: {
  sessionId: string;
  initialFiles?: FileStructure[];
  onFileSelect?: (file: FileStructure) => void;
}) {
  const { toast } = useToast();
  const [files, setFiles] = useState<FileStructure[]>(initialFiles);
  const [selectedFile, setSelectedFile] = useState<FileStructure | null>(null);
  const [renamingFile, setRenamingFile] = useState<{id: string, name: string} | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['/app']);
  const [isLoading, setIsLoading] = useState(false);

  // Load files from container on mount
  useEffect(() => {
    loadFiles();
  }, [sessionId]);

  const loadFiles = async (path = '/app') => {
    setIsLoading(true);
    try {
      const result = await apiService.executeCommand(`ls -p "${path}"`, 30000, sessionId);
      if (result.success) {
        const entries = result.data?.output.split('\n').filter(Boolean) || [];
        const newFiles: FileStructure[] = [];

        for (const entry of entries) {
          const isFolder = entry.endsWith('/');
          const name = isFolder ? entry.slice(0, -1) : entry;
          const fullPath = `${path}/${name}`.replace(/\/+/g, '/');
          const id = fullPath;

          if (isFolder) {
            newFiles.push({
              id,
              name,
              type: 'folder',
              path: fullPath,
              children: []
            });
          } else {
            // Get file content
            const contentResult = await apiService.executeCommand(
              `cat "${fullPath}"`, 
              30000,
              sessionId
            );
            
            newFiles.push({
              id,
              name,
              type: 'file',
              path: fullPath,
              content: contentResult.success ? contentResult.data?.output : ''
            });
          }
        }

        setFiles(prev => {
          if (path === '/app') {
            return newFiles;
          }
          
          const updateFiles = (files: FileStructure[]): FileStructure[] => {
            return files.map(f => {
              if (f.path === path) {
                return { ...f, children: newFiles };
              }
              if (f.children) {
                return { ...f, children: updateFiles(f.children) };
              }
              return f;
            });
          };
          
          return updateFiles(prev);
        });

        return newFiles;
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load files',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
    return [];
  };

  const handleFileSelect = (file: FileStructure) => {
    setSelectedFile(file);
    setRenamingFile(null);
    onFileSelect?.(file);
  };

  const handleCreate = async (type: 'file' | 'folder', parentPath = '/app') => {
    const name = prompt(`Enter ${type} name:`);
    if (!name) return;

    try {
      const fullPath = `${parentPath}/${name}`.replace(/\/+/g, '/');
      if (type === 'folder') {
        await apiService.executeCommand(`mkdir -p "${fullPath}"`, 30000, sessionId);
      } else {
        await apiService.executeCommand(`touch "${fullPath}" && chmod 666 "${fullPath}"`, 30000, sessionId);
      }
      
      await loadFiles(parentPath);

      if (!expandedFolders.includes(parentPath)) {
        setExpandedFolders(prev => [...prev, parentPath]);
      }

      toast({
        title: 'Success',
        description: `${type} created successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to create ${type}`,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (file: FileStructure) => {
    if (!confirm(`Are you sure you want to delete ${file.name}?`)) return;

    try {
      const command = file.type === 'folder' 
        ? `rm -rf "${file.path}"`
        : `rm "${file.path}"`;
      
      await apiService.executeCommand(command, 30000, sessionId);
      
      const parentPath = file.path.split('/').slice(0, -1).join('/') || '/app';
      await loadFiles(parentPath);

      if (selectedFile?.id === file.id) {
        setSelectedFile(null);
      }
      
      toast({
        title: 'Success',
        description: `${file.type} deleted successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to delete ${file.type}`,
        variant: 'destructive',
      });
    }
  };

  const handleRenameStart = (file: FileStructure) => {
    setRenamingFile({ id: file.id, name: file.name });
  };

  const handleRename = async (newName: string) => {
    if (!renamingFile || !newName.trim()) {
      setRenamingFile(null);
      return;
    }

    const file = findFile(files, renamingFile.id);
    if (!file) return;

    try {
      const newPath = file.path.split('/').slice(0, -1).concat(newName).join('/');
      await apiService.executeCommand(
        `mv "${file.path}" "${newPath}"`, 
        30000,
        sessionId
      );
      
      const parentPath = file.path.split('/').slice(0, -1).join('/') || '/app';
      await loadFiles(parentPath);

      if (selectedFile?.id === file.id) {
        setSelectedFile(null);
      }
      
      toast({
        title: 'Success',
        description: 'File renamed successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to rename file',
        variant: 'destructive',
      });
    } finally {
      setRenamingFile(null);
    }
  };

  const handleSaveFile = async () => {
    if (!selectedFile) return;
  
    try {
      await fileService.saveFile(
        sessionId,
        selectedFile.path,
        selectedFile.content || ''
      );
      
      toast({
        title: 'Success',
        description: 'File saved successfully',
      });
      
      // Refresh the file content to ensure consistency
      const updatedContent = await fileService.getFileContent(
        sessionId, 
        selectedFile.path
      );
      setSelectedFile({
        ...selectedFile,
        content: updatedContent
      });
      
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save file',
        variant: 'destructive',
      });
    }
  };

  const renderFileTree = (files: FileStructure[]) => {
    return files.map(file => {
      if (file.type === 'folder') {
        return (
          <Folder
            key={file.id}
            element={
              <div className="flex items-center justify-between w-full">
                {renamingFile?.id === file.id ? (
                  <Input
                    autoFocus
                    defaultValue={renamingFile.name}
                    onBlur={(e) => handleRename(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename(e.currentTarget.value);
                      if (e.key === 'Escape') setRenamingFile(null);
                    }}
                    className="h-6 px-1"
                  />
                ) : (
                  <span className="flex-1">{file.name}</span>
                )}
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreate('file', file.path);
                    }}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRenameStart(file);
                    }}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(file);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            }
            value={file.id}
            isSelectable={true}
            closeIcon={<FolderIcon className="size-4" />}
            openIcon={<FolderOpenIcon className="size-4" />}
            onClick={() => handleFileSelect(file)}
          >
            {file.children && renderFileTree(file.children)}
          </Folder>
        );
      }

      return (
        <File
          key={file.id}
          value={file.id}
          isSelect={selectedFile?.id === file.id}
          onClick={() => handleFileSelect(file)}
          fileIcon={<FileIcon className="size-4" />}
        >
          <div className="flex items-center justify-between w-full">
            {renamingFile?.id === file.id ? (
              <Input
                autoFocus
                defaultValue={renamingFile.name}
                onBlur={(e) => handleRename(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename(e.currentTarget.value);
                  if (e.key === 'Escape') setRenamingFile(null);
                }}
                className="h-6 px-1"
              />
            ) : (
              <span className="flex-1">{file.name}</span>
            )}
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRenameStart(file);
                }}
              >
                <Pencil className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(file);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </File>
      );
    });
  };

  return (
    <PanelGroup direction="horizontal" className="h-full border rounded-lg">
      <Panel defaultSize={30} minSize={20} className="flex flex-col">
        <div className="p-2 border-b flex justify-between items-center">
          <h3 className="font-medium">File Explorer</h3>
          <div className="flex gap-2">
            <Button 
              variant="ghost"
              size="sm" 
              onClick={() => handleCreate('file')}
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-1" /> File
            </Button>
            <Button 
              variant="ghost"
              size="sm" 
              onClick={() => handleCreate('folder')}
              disabled={isLoading}
            >
              <FolderIcon className="h-4 w-4 mr-1" /> Folder
            </Button>
          </div>
        </div>
        <Tree 
          className="flex-1 overflow-auto"
          initialExpandedItems={expandedFolders}
          onValueChange={(values) => setExpandedFolders(values)}
        >
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading files...
            </div>
          ) : (
            renderFileTree(files)
          )}
        </Tree>
      </Panel>
      <PanelResizeHandle className="w-1 bg-gray-200 dark:bg-gray-700 hover:bg-blue-500 transition-colors" />
      <Panel defaultSize={70} className="flex flex-col">
        {selectedFile ? (
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center p-2 border-b">
              <div className="flex items-center gap-2">
                {selectedFile.type === 'file' ? (
                  <FileIcon size={16} />
                ) : (
                  <FolderIcon size={16} />
                )}
                <span className="font-medium">{selectedFile.name}</span>
              </div>
              {selectedFile.type === 'file' ? (
                <Button 
                  size="sm"
                  onClick={handleSaveFile}
                  disabled={isLoading}
                >
                  Save
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    size="sm"
                    onClick={() => handleCreate('file', selectedFile.path)}
                    disabled={isLoading}
                  >
                    <Plus className="h-4 w-4 mr-1" /> File
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleCreate('folder', selectedFile.path)}
                    disabled={isLoading}
                  >
                    <FolderIcon className="h-4 w-4 mr-1" /> Folder
                  </Button>
                </div>
              )}
            </div>
            <div className="flex-1 overflow-auto">
              {selectedFile.type === 'file' ? (
                <Textarea
                  value={selectedFile.content || ''}
                  onChange={(e) => {
                    setSelectedFile({
                      ...selectedFile,
                      content: e.target.value
                    });
                  }}
                  className="h-full w-full font-mono text-sm border-0 rounded-none resize-none"
                  spellCheck={false}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Select a file inside this folder to edit
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            {isLoading ? 'Loading...' : 'Select a file to edit'}
          </div>
        )}
      </Panel>
    </PanelGroup>
  );
}

function findFile(files: FileStructure[], id: string): FileStructure | null {
  for (const file of files) {
    if (file.id === id) return file;
    if (file.children) {
      const found = findFile(file.children, id);
      if (found) return found;
    }
  }
  return null;
}