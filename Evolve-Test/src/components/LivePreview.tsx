
import React, { useRef, useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { RefreshCw } from 'lucide-react';

interface LivePreviewProps {
  html: string;
  css: string;
  js: string;
}

const LivePreview: React.FC<LivePreviewProps> = ({ html, css, js }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const updatePreview = () => {
    if (!iframeRef.current) return;
    
    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    
    if (!iframeDoc) return;
    
    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>${css}</style>
        </head>
        <body>
          ${html}
          <script>
            try {
              ${js}
            } catch (error) {
              console.error('Preview error:', error);
            }
          </script>
        </body>
      </html>
    `);
    iframeDoc.close();
  };

  const refreshPreview = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      updatePreview();
      setIsRefreshing(false);
    }, 300);
  };

  useEffect(() => {
    updatePreview();
  }, [html, css, js]);

  return (
    <Card className="h-full flex flex-col overflow-hidden border">
      <div className="flex items-center justify-between p-2 border-b bg-muted/30">
        <h3 className="text-sm font-medium">Preview</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={refreshPreview}
          disabled={isRefreshing}
          className="h-8"
        >
          <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
        </Button>
      </div>
      <div className="flex-1 overflow-hidden bg-white">
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0"
          title="Live Preview"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </Card>
  );
};

export default LivePreview;
