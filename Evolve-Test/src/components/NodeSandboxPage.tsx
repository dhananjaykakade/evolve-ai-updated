import { useState, useEffect, useRef } from 'react';
import { apiService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { FileExplorer } from './file-explorer';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Terminal } from './terminal';
import { ChevronDown, ChevronRight, Play, StopCircle, RefreshCw, ExternalLink } from 'lucide-react';

interface FileStructure {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileStructure[];
}

export function NodeSandboxPage() {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<FileStructure | null>(null);
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [serverRunning, setServerRunning] = useState(false);
  const [serverPort, setServerPort] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [command, setCommand] = useState('');
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Scroll terminal to bottom
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalOutput]);

  useEffect(() => {
    const storedSessionId = localStorage.getItem('nodeSandboxSessionId');
    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      const newSessionId = Math.random().toString(36).substring(2, 11);
      localStorage.setItem('nodeSandboxSessionId', newSessionId);
      setSessionId(newSessionId);
    }
  }, []);

  const handleFileSelect = (file: FileStructure) => {
    setSelectedFile(file);
  };

  const startServer = async () => {
    if (!selectedFile || selectedFile.type !== 'file') {
      toast({
        title: 'Error',
        description: 'Please select a server file to execute',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setOutput('');
    
    try {
      const result = await apiService.startNodeServer({
        code: selectedFile.content || '',
        sessionId
      });
      
      if (result.success && result) {
        setOutput(result.output);
        setServerPort(result.port);
        setServerRunning(true);
        toast({
          title: 'Server Started',
          description: `Node.js server is running on port ${result.port}`,
        });
      } else {
        setOutput(result.error || 'Failed to start server');
        toast({
          title: 'Server Failed',
          description: result.error || 'Unknown error',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const stopServer = async () => {
    setIsLoading(true);
    try {
      const result = await apiService.stopNodeServer({sessionId});
      
      if (result.success) {
        setOutput(prev => prev + '\nServer stopped successfully');
        setServerRunning(false);
        setServerPort(null);
        toast({
          title: 'Server Stopped',
          description: 'Node.js server has been stopped',
        });
      } else {
        setOutput(prev => prev + '\n' + (result.error || 'Failed to stop server'));
        toast({
          title: 'Error',
          description: result.error || 'Failed to stop server',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const executeCommand = async (cmd: string) => {
      const commandToExecute = cmd.trim();
      if (!commandToExecute) return;
  
      // Add command to terminal output
      setTerminalOutput(prev => [...prev, `$ ${commandToExecute}`]);

    try {
      if (command === 'clear') {
        setTerminalOutput([]);
        return;
      }

      // Execute via API
      const result = await apiService.executeCommand(commandToExecute, 30000, sessionId);
      
      if (result.success && result.data) {
        setTerminalOutput(prev => [...prev, result.data.output]);
      } else {
        setTerminalOutput(prev => [...prev, result.error || 'Command failed']);
      }
    } catch (error) {
      setTerminalOutput(prev => [...prev, `Error: ${error instanceof Error ? error.message : 'Unknown error'}`]);
    }
  };

  const handleTerminalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      executeCommand(command);
    }
  };

  const getServerUrl = () => {
    if (!serverPort) return '';
    return `http://${window.location.hostname}:${serverPort}`;
  };

  return (
    <div className="flex flex-col h-full gap-4 p-4">
      <h1 className="text-2xl font-bold">Node.js Development Environment</h1>
      
      <PanelGroup direction="horizontal" className="flex-1 gap-4">
        {/* File Explorer - Left Panel */}
        <Panel defaultSize={25} minSize={20} className="flex flex-col">
        <FileExplorer 
  sessionId={sessionId} 
  initialFiles={[
    {
      id: '/app/server.js',
      name: 'server.js',
      type: 'file',
      path: '/app/server.js',
      content: `...`
    },
    {
      id: '/app/package.json',
      name: 'package.json',
      type: 'file',
      path: '/app/package.json',
      content: `...`
    }
  ]}
  onFileSelect={handleFileSelect}
/>
        </Panel>

        <PanelResizeHandle className="w-2 bg-gray-200 hover:bg-blue-500 transition-colors" />

        {/* Main Content - Middle Panel */}
        <Panel defaultSize={50} className="flex flex-col gap-4">
          {/* Editor and Server Controls */}
          <Card className="flex-1">
            <CardHeader className="flex flex-row items-center justify-between p-4">
              <CardTitle>
                {selectedFile ? (
                  <div className="flex items-center gap-2">
                    {selectedFile.name}
                    {selectedFile.type === 'file' && (
                      <span className="text-sm text-muted-foreground">
                        {selectedFile.name.endsWith('.js') ? 'JavaScript' : 
                         selectedFile.name.endsWith('.json') ? 'JSON' : ''}
                      </span>
                    )}
                  </div>
                ) : 'No file selected'}
              </CardTitle>
              {selectedFile?.type === 'file' && (
                <div className="flex gap-2">
                  <Button 
                    size="sm"
                    onClick={startServer}
                    disabled={isLoading || serverRunning}
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    Run
                  </Button>
                  <Button 
                    size="sm"
                    onClick={stopServer}
                    disabled={isLoading || !serverRunning}
                    variant="destructive"
                  >
                    <StopCircle className="h-4 w-4 mr-2" />
                    Stop
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="h-[calc(100%-60px)]">
              {selectedFile ? (
                <Textarea
                  value={selectedFile.content || ''}
                  className="h-full w-full font-mono text-sm"
                  placeholder="File content"
                  readOnly={isLoading}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Select a file to edit
                </div>
              )}
            </CardContent>
          </Card>

          {/* Terminal - Bottom Panel */}
          <Card className="h-[200px]">
            <CardHeader className="p-3">
              <CardTitle className="text-sm">Terminal</CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(100%-40px)] p-0">
              <Terminal 
                output={terminalOutput}
                command={command}
                onCommandChange={setCommand}
                onExecute={executeCommand}
                onKeyDown={handleTerminalKeyDown}
                endRef={terminalEndRef}
              />
            </CardContent>
          </Card>
        </Panel>

        <PanelResizeHandle className="w-2 bg-gray-200 hover:bg-blue-500 transition-colors" />

        {/* Server Info - Right Panel */}
        <Panel defaultSize={25} minSize={20} className="flex flex-col gap-4">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Server Status</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${
                  serverRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                }`} />
                <span className="font-medium">
                  {serverRunning ? 'Server is running' : 'Server is stopped'}
                </span>
              </div>

              {serverRunning && (
                <div>
                  <h3 className="font-medium mb-2">Access Server</h3>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    asChild
                  >
                    <a 
                      href={getServerUrl()} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open in new tab
                    </a>
                  </Button>
                  <div className="mt-2 text-sm text-muted-foreground break-all">
                    {getServerUrl()}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-medium mb-2">Console Output</h3>
                <pre className="bg-muted p-3 rounded-md overflow-auto h-40 text-xs">
                  {output || 'Server output will appear here...'}
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                onClick={() => executeCommand('npm install')}
                disabled={isLoading}
              >
                Install Dependencies
              </Button>
              <Button 
                variant="outline" 
                onClick={() => executeCommand('npm start')}
                disabled={isLoading}
              >
                Start via npm
              </Button>
              <Button 
                variant="outline" 
                onClick={() => executeCommand('clear')}
              >
                Clear Terminal
              </Button>
              <Button 
                variant="outline" 
                onClick={() => executeCommand('ls -la')}
              >
                List Files
              </Button>
            </CardContent>
          </Card>
        </Panel>
      </PanelGroup>
    </div>
  );
}