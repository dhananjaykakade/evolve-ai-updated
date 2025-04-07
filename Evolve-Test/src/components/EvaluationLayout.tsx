import { Link, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { apiService } from '@/lib/api';
import { useState, useEffect } from 'react';

export function EvaluationLayout() {
  const { toast } = useToast();
  const [serviceStatus, setServiceStatus] = useState<'healthy' | 'unhealthy' | 'checking'>('checking');

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

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Code Evaluation Portal</h1>
        <div className="flex items-center gap-4">
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
          <div className="flex gap-2">
            <Button asChild variant="ghost">
              <Link to="/web">Web Sandbox</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/node">Node Sandbox</Link>
            </Button>
          </div>
        </div>
      </div>
      
      <Outlet />
    </div>
  );
}