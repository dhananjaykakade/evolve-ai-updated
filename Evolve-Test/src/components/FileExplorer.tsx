
import React, { useState } from 'react';
import { Folder, File, ChevronRight, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';

export type FileType = {
  id: string;
  name: string;
  content: string;
  type: 'file';
  language: 'javascript' | 'typescript' | 'html' | 'css' | 'json';
};

export type FolderType = {
  id: string;
  name: string;
  type: 'folder';
  children: (FileType | FolderType)[];
  expanded?: boolean;
};

export type FileSystemItem = FileType | FolderType;

interface FileExplorerProps {
  files: FileSystemItem[];
  onFilesChange: (files: FileSystemItem[]) => void;
  onSelectFile: (file: FileType) => void;
  selectedFileId: string | null;
}

const isFolder = (item: FileSystemItem): item is FolderType => item.type === 'folder';
const isFile = (item: FileSystemItem): item is FileType => item.type === 'file';

const getFileLanguage = (fileName: string): FileType['language'] => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  if (extension === 'js') return 'javascript';
  if (extension === 'ts') return 'typescript';
  if (extension === 'html') return 'html';
  if (extension === 'css') return 'css';
  if (extension === 'json') return 'json';
  return 'javascript'; // Default
};

const FileExplorer: React.FC<FileExplorerProps> = ({ 
  files, 
  onFilesChange, 
  onSelectFile,
  selectedFileId 
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState<'file' | 'folder'>('file');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const handleCreateItem = (parentId: string | null) => {
    setCurrentFolderId(parentId);
    setNewItemName('');
    setIsCreateDialogOpen(true);
  };

  const handleCreateItemSubmit = () => {
    if (!newItemName.trim()) {
      return;
    }

    const newId = `${newItemType}-${Date.now()}`;
    const newItem = newItemType === 'file'
      ? {
          id: newId,
          name: newItemName,
          content: '',
          type: 'file' as const,
          language: getFileLanguage(newItemName)
        }
      : {
          id: newId,
          name: newItemName,
          type: 'folder' as const,
          children: []
        };

    // Add to root if no parent
    if (currentFolderId === null) {
      onFilesChange([...files, newItem]);
    } else {
      // Add to specific folder
      const updatedFiles = addItemToFolder(files, currentFolderId, newItem);
      onFilesChange(updatedFiles);
      
      // Expand the folder
      setExpandedFolders(prev => ({
        ...prev,
        [currentFolderId]: true
      }));
    }

    setIsCreateDialogOpen(false);
  };

  const addItemToFolder = (
    items: FileSystemItem[],
    folderId: string,
    newItem: FileSystemItem
  ): FileSystemItem[] => {
    return items.map(item => {
      if (item.id === folderId && isFolder(item)) {
        return {
          ...item,
          children: [...item.children, newItem]
        };
      } else if (isFolder(item)) {
        return {
          ...item,
          children: addItemToFolder(item.children, folderId, newItem)
        };
      }
      return item;
    });
  };

  const handleDeleteItem = (itemId: string, parentId: string | null) => {
    if (parentId === null) {
      onFilesChange(files.filter(item => item.id !== itemId));
    } else {
      const updatedFiles = deleteItemFromFolder(files, parentId, itemId);
      onFilesChange(updatedFiles);
    }
  };

  const deleteItemFromFolder = (
    items: FileSystemItem[],
    folderId: string,
    itemIdToDelete: string
  ): FileSystemItem[] => {
    return items.map(item => {
      if (item.id === folderId && isFolder(item)) {
        return {
          ...item,
          children: item.children.filter(child => child.id !== itemIdToDelete)
        };
      } else if (isFolder(item)) {
        return {
          ...item,
          children: deleteItemFromFolder(item.children, folderId, itemIdToDelete)
        };
      }
      return item;
    });
  };

  const renderItem = (item: FileSystemItem, parentId: string | null = null, level = 0) => {
    const isExpanded = expandedFolders[item.id] || false;
    const isSelected = selectedFileId === item.id;

    return (
      <div key={item.id} className="select-none">
        <div 
          className={`flex items-center py-1 px-2 rounded hover:bg-muted/60 ${isSelected ? 'bg-muted' : ''}`}
          style={{ paddingLeft: `${(level * 12) + 8}px` }}
        >
          {isFolder(item) ? (
            <>
              <button 
                onClick={() => toggleFolder(item.id)} 
                className="mr-1 focus:outline-none"
              >
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              <Folder size={16} className="mr-2 text-blue-500" />
              <span className="flex-grow">{item.name}</span>
              <div className="flex space-x-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6" 
                        onClick={() => handleCreateItem(item.id)}
                      >
                        <Plus size={14} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Add item</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6" 
                        onClick={() => handleDeleteItem(item.id, parentId)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete folder</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </>
          ) : (
            <>
              <File size={16} className="ml-4 mr-2 text-gray-500" />
              <span 
                className="flex-grow cursor-pointer"
                onClick={() => isFile(item) && onSelectFile(item)}
              >
                {item.name}
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6" 
                      onClick={() => handleDeleteItem(item.id, parentId)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete file</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </div>
        
        {isFolder(item) && isExpanded && (
          <div className="ml-2">
            {item.children.map(child => renderItem(child, item.id, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full overflow-auto border rounded-md p-2 bg-background">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium">Files</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleCreateItem(null)}
          className="h-7"
        >
          <Plus size={16} className="mr-1" /> New
        </Button>
      </div>
      
      <div className="space-y-1">
        {files.map(file => renderItem(file))}
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New {newItemType === 'file' ? 'File' : 'Folder'}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex space-x-2">
              <Button
                variant={newItemType === 'file' ? 'default' : 'outline'}
                onClick={() => setNewItemType('file')}
                className="flex-1"
              >
                File
              </Button>
              <Button
                variant={newItemType === 'folder' ? 'default' : 'outline'}
                onClick={() => setNewItemType('folder')}
                className="flex-1"
              >
                Folder
              </Button>
            </div>
            <Input
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder={newItemType === 'file' ? 'filename.js' : 'folder name'}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateItemSubmit}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FileExplorer;
