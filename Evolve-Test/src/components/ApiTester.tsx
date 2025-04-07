// src/components/EvaluationPortal.tsx
import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

type SandboxMode = 'web' | 'node';

export function EvaluationPortal() {
  const { toast } = useToast();
  const [mode, setMode] = useState<SandboxMode>('web');
  const [isLoading, setIsLoading] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<'healthy' | 'unhealthy' | 'checking'>('checking');

  // Web sandbox state
  const [html, setHtml] = useState('<div>Hello World</div>');
  const [css, setCss] = useState('div { color: blue; }');
  const [js, setJs] = useState('console.log("Hello")');
  const [previewContent, setPreviewContent] = useState('');

  // Node sandbox state
  const [nodeCode, setNodeCode] = useState('console.log("Hello from Node");');
  const [nodeResult, setNodeResult] = useState('');
  const [apiMethod, setApiMethod] = useState('GET');
  const [apiUrl, setApiUrl] = useState('');
  const [apiBody, setApiBody] = useState('{}');
  const [apiHeaders, setApiHeaders] = useState('{"Content-Type": "application/json"}');
  const [apiResponse, setApiResponse] = useState('');

  useEffect(() => {
    checkServiceHealth();
  }, []);

  const checkServiceHealth = async () => {
    setServiceStatus('checking');
    const result = await apiService.checkFrontendHealth();
    setServiceStatus(result.success ? 'healthy' : 'unhealthy');
    
    if (!result.success) {
      toast({
        title: 'Service Warning',
        description: 'Sandbox service is unavailable. Some features may not work.',
        variant: 'destructive',
      });
    }
  };

  const executeWebCode = async () => {
    setIsLoading(true);
    const result = await apiService.executeWeb(html, css, js);
    setIsLoading(false);

    if (result.success && result.data) {
      setPreviewContent(result.data.combined);
      toast({
        title: 'Execution Successful',
        description: 'Web code executed successfully',
      });
    } else {
      toast({
        title: 'Execution Failed',
        description: result.error || 'Failed to execute web code',
        variant: 'destructive',
      });
    }
  };

  const executeNodeCode = async () => {
    setIsLoading(true);
    const result = await apiService.executeNode(nodeCode);
    setIsLoading(false);

    if (result.success && result.data) {
      setNodeResult(result.data.output);
      toast({
        title: 'Execution Successful',
        description: `Node code executed successfully.`,
      });
    } else {
      toast({
        title: 'Execution Failed',
        description: result.error || 'Failed to execute Node code',
        variant: 'destructive',
      });
    }
  };

  const executeApiRequest = async () => {
    if (!apiUrl) {
      toast({
        title: 'Error',
        description: 'Please enter a valid URL',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // In a real app, this would call your proxy service
      // For demo, we'll mock it
      const response = await fetch(apiUrl, {
        method: apiMethod,
        headers: JSON.parse(apiHeaders),
        body: apiMethod !== 'GET' ? apiBody : undefined,
      });
      const data = await response.json();
      setApiResponse(JSON.stringify(data, null, 2));
      toast({
        title: 'Request Successful',
        description: `API request completed with status ${response.status}`,
      });
    } catch (error) {
      setApiResponse(JSON.stringify({ error: error instanceof Error ? error.message : 'Request failed' }, null, 2));
      toast({
        title: 'Request Failed',
        description: 'Failed to execute API request',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Code Evaluation Portal</h1>
        <div className="flex items-center gap-2">
          <span className={`h-3 w-3 rounded-full ${
            serviceStatus === 'healthy' ? 'bg-green-500' : 
            serviceStatus === 'unhealthy' ? 'bg-red-500' : 'bg-yellow-500'
          }`} />
          <span className="text-sm text-muted-foreground">
            {serviceStatus === 'healthy' ? 'Service Healthy' : 
             serviceStatus === 'unhealthy' ? 'Service Unavailable' : 'Checking Status'}
          </span>
        </div>
      </div>

      <Tabs value={mode} onValueChange={(v) => setMode(v as SandboxMode)} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="web">Web Development</TabsTrigger>
          <TabsTrigger value="node">Node.js API</TabsTrigger>
        </TabsList>

        <TabsContent value="web" className="flex-1 flex flex-col">
          <Card className="flex-1 flex flex-col">
            <CardHeader>
              <CardTitle>Web Development Sandbox</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              <ResizablePanelGroup direction="horizontal" className="flex-1 rounded-lg border">
                <ResizablePanel defaultSize={50} className="p-4">
                  <Tabs defaultValue="html" className="h-full flex flex-col">
                    <TabsList className="grid grid-cols-3">
                      <TabsTrigger value="html">HTML</TabsTrigger>
                      <TabsTrigger value="css">CSS</TabsTrigger>
                      <TabsTrigger value="js">JavaScript</TabsTrigger>
                    </TabsList>
                    <TabsContent value="html" className="flex-1">
                      <Textarea
                        value={html}
                        onChange={(e) => setHtml(e.target.value)}
                        className="h-full font-mono text-sm"
                        placeholder="Enter HTML code"
                      />
                    </TabsContent>
                    <TabsContent value="css" className="flex-1">
                      <Textarea
                        value={css}
                        onChange={(e) => setCss(e.target.value)}
                        className="h-full font-mono text-sm"
                        placeholder="Enter CSS code"
                      />
                    </TabsContent>
                    <TabsContent value="js" className="flex-1">
                      <Textarea
                        value={js}
                        onChange={(e) => setJs(e.target.value)}
                        className="h-full font-mono text-sm"
                        placeholder="Enter JavaScript code"
                      />
                    </TabsContent>
                  </Tabs>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={50} className="p-4">
                  <div className="flex flex-col h-full">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">Live Preview</h3>
                      <Button 
                        size="sm" 
                        onClick={executeWebCode}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Running...' : 'Run Code'}
                      </Button>
                    </div>
                    <div className="flex-1 border rounded-md overflow-hidden">
                      {previewContent ? (
                        <iframe
                          srcDoc={previewContent}
                          title="preview"
                          sandbox="allow-scripts"
                          className="w-full h-full border-0"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          Preview will appear here
                        </div>
                      )}
                    </div>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="node" className="flex-1 flex flex-col">
          <div className="flex flex-1 gap-4">
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Node.js Code Runner</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Textarea
                  value={nodeCode}
                  onChange={(e) => setNodeCode(e.target.value)}
                  className="h-64 font-mono text-sm"
                  placeholder="Enter Node.js code"
                />
                <Button 
                  onClick={executeNodeCode}
                  disabled={isLoading}
                >
                  {isLoading ? 'Running...' : 'Run Code'}
                </Button>
                <div>
                  <h3 className="font-medium mb-2">Output</h3>
                  <pre className="bg-muted p-4 rounded-md overflow-auto max-h-40">
                    {nodeResult || 'Output will appear here...'}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card className="flex-1">
              <CardHeader>
                <CardTitle>API Tester</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex gap-2">
                  <Select value={apiMethod} onValueChange={setApiMethod}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    placeholder="Enter API endpoint URL"
                    className="flex-1"
                  />
                  <Button 
                    onClick={executeApiRequest}
                    disabled={isLoading || !apiUrl}
                  >
                    {isLoading ? 'Sending...' : 'Send'}
                  </Button>
                </div>

                <Tabs defaultValue="body">
                  <TabsList>
                    <TabsTrigger value="body">Body</TabsTrigger>
                    <TabsTrigger value="headers">Headers</TabsTrigger>
                  </TabsList>
                  <TabsContent value="body">
                    <Textarea
                      value={apiBody}
                      onChange={(e) => setApiBody(e.target.value)}
                      placeholder="Request body (JSON)"
                      className="h-32 font-mono text-sm"
                    />
                  </TabsContent>
                  <TabsContent value="headers">
                    <Textarea
                      value={apiHeaders}
                      onChange={(e) => setApiHeaders(e.target.value)}
                      placeholder="Request headers (JSON)"
                      className="h-32 font-mono text-sm"
                    />
                  </TabsContent>
                </Tabs>

                <div>
                  <h3 className="font-medium mb-2">Response</h3>
                  <pre className="bg-muted p-4 rounded-md overflow-auto max-h-64 text-sm">
                    {apiResponse || 'Response will appear here...'}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}