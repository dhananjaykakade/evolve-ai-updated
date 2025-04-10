import { useState } from 'react';
import { apiService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

export function WebSandboxPage() {
  const { toast } = useToast();
  const [html, setHtml] = useState('<div>Hello World</div>');
  const [css, setCss] = useState('div { color: blue; }');
  const [js, setJs] = useState('console.log("Hello")');
  const [previewContent, setPreviewContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const executeCode = async () => {
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

  return (
    <div className="flex flex-col h-full gap-4">
      <h1 className="text-2xl font-bold">Web Development Sandbox</h1>
      
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle>Edit and Preview</CardTitle>
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
                    onClick={executeCode}
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
                      sandbox="allow-scripts allow-same-origin"
                      className="w-full h-full border-0"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Execute code to see preview
                    </div>
                  )}
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </CardContent>
      </Card>
    </div>
  );
}