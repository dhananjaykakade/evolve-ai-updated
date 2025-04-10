// src/lib/api.ts
interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    status?: number;
    executionTime?: number;
  }

  interface StopNodeServerResponse {
    success: boolean;
    output: string;
    error?: string;
  }
  

  interface FileStructure {
    id: string;
    name: string;
    type: 'file' | 'folder';
    path: string;
    content?: string;
    children?: FileStructure[];
  }

  interface ProxyRequestPayload {
    method: string;
    url: string;
    body?: any;
    headers?: Record<string, string>;
  }

  
  interface ExecuteNodePayload {
    code: string;
    timeout?: number;
  }
  
  interface ExecuteWebPayload {
    html: string;
    css: string;
    js: string;
    timeout?: number;
  }
  

  interface StartNodeServerParams {
    code: string;
    sessionId: string;
  }

  interface StopNodeServerParams {
    sessionId: string;
  }
  
  interface StartNodeServerResponse {
    success: boolean;
    output: string;
    port: number;
    error?: string;
  }

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:9001';
  const DEFAULT_TIMEOUT = 10000;
  
  async function fetchWithTimeout(
    url: string,
    options: RequestInit & { timeout?: number } = {}
  ): Promise<Response> {
    const { timeout = DEFAULT_TIMEOUT, ...fetchOptions } = options;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
  
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
  
  async function handleApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        return {
          success: false,
          error: errorData.message || errorData.error || `HTTP error! status: ${response.status}`,
          status: response.status,
        };
      } catch {
        return {
          success: false,
          error: errorText || `HTTP error! status: ${response.status}`,
          status: response.status,
        };
      }
    }
  
    try {
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to parse JSON response',
        status: response.status,
      };
    }
  }
  
  export const apiService = {

    async executeCommand(
        command: string,
        timeout?: number,
        sessionId?: string,
      ): Promise<ApiResponse<{ output: string }>> {
        try {
          const startTime = performance.now();
          const response = await fetchWithTimeout(`${BACKEND_URL}/exam/execute/command`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Session-ID': sessionId
            },
            body: JSON.stringify({ command, timeout }),
            timeout,
          });
    
          const result = await handleApiResponse<{ output: string }>(response);
          const endTime = performance.now();
    
          return {
            ...result,
            executionTime: endTime - startTime,
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to execute command',
          };
        }
      },


      

      async getFileStructure(sessionId: string): Promise<ApiResponse<FileStructure[]>> {
        try {
          // Get initial file structure
          const lsResult = await this.executeCommand('ls -p /app', sessionId);
          if (!lsResult.success) return lsResult;
    
          const files: FileStructure[] = [];
          const entries = lsResult.data?.output.split('\n').filter(Boolean) || [];
    
          for (const entry of entries) {
            const isFolder = entry.endsWith('/');
            const name = isFolder ? entry.slice(0, -1) : entry;
            const path = `/app/${name}`;
            const id = path;
    
            if (isFolder) {
              files.push({ id, name, type: 'folder', path });
            } else {
              const contentResult = await this.executeCommand(`cat ${path}`, sessionId);
              files.push({
                id,
                name,
                type: 'file',
                path,
                content: contentResult.success ? contentResult.data?.output : ''
              });
            }
          }
    
          return { success: true, data: files };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to load files',
          };
        }
      },

    async executeNode(code: string, timeout?: number): Promise<ApiResponse<{ output: string }>> {
        console.log(code ,timeout)
      try {
        const startTime = performance.now();
        const response = await fetchWithTimeout(`${BACKEND_URL}/exam/api/proxy`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            // 'Authorization': `Bearer ${import.meta.env.VITE_API_SECRET || ''}`,
          },
          body: JSON.stringify({
            method: 'POST',
            url: `${BACKEND_URL}/exam/execute/node`, // Changed to use backend directly
            body: { code, timeout },
          }),
          timeout,
        });
  
        const result = await handleApiResponse<{ output: string }>(response);
        const endTime = performance.now();
  
        return {
          ...result,
          executionTime: endTime - startTime,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to execute Node.js code',
        };
      }
    },
  
    async executeWeb(
      html: string,
      css: string,
      js: string,
      timeout?: number
    ): Promise<ApiResponse<{ previewUrl: string; combined: string }>> {
      try {
        const response = await fetchWithTimeout(`${BACKEND_URL}/exam/api/proxy`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_API_SECRET || ''}`,
          },
          body: JSON.stringify({
            method: 'POST',
            url: `${BACKEND_URL}/exam/execute/web`, // Changed to use backend directly
            body: { html, css, js, timeout },
          }),
          timeout,
        });
  
        return handleApiResponse(response);
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to execute web code',
        };
      }
    },
  
    async checkBackendHealth(): Promise<ApiResponse<{ status: string }>> {
      try {
        const response = await fetchWithTimeout(`${BACKEND_URL}/backend-health`, {
          method: 'GET',
          timeout: 3000,
        });
        return handleApiResponse(response);
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Backend service unavailable',
        };
      }
    },
    async startNodeServer({ code, sessionId }: StartNodeServerParams): Promise<StartNodeServerResponse> {
      try {
        const response = await fetch(`${BACKEND_URL}/exam/api/node-server/start`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            sessionId
          }),
        });
    
        const data = await response.json();
    
        if (!response.ok) {
          return {
            success: false,
            output: data.error || 'Failed to start server',
            port: 0,
            error: data.error
          };
        }
    
        return {
          success: true,
          output: data.output || 'Server started successfully',
          port: data.port,
        };
      } catch (error) {
        return {
          success: false,
          output: 'Network error while starting server',
          port: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }
,    
  
    async checkFrontendHealth(): Promise<ApiResponse<{ status: string }>> {
      try {
        const response = await fetchWithTimeout(`${BACKEND_URL}/exam/api/proxy`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            method: 'GET',
            url: `${window.location.origin}/health`,
          }),
          timeout: 3000,
        });
        return handleApiResponse(response);
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Frontend health check failed',
        };
      }
    },
    async stopNodeServer({ sessionId }: StopNodeServerParams): Promise<StopNodeServerResponse> {
      try {
        const response = await fetch(`${BACKEND_URL}/exam/api/node-server/stop`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId
          }),
        });
  
        const data = await response.json();
  
        if (!response.ok) {
          return {
            success: false,
            output: data.error || 'Failed to stop server',
            error: data.error
          };
        }
  
        return {
          success: true,
          output: data.output || 'Server stopped successfully',
        };
      } catch (error) {
        return {
          success: false,
          output: 'Network error while stopping server',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    },
  
    async proxyRequest(payload: ProxyRequestPayload): Promise<any> {
        const response = await fetch(`${BACKEND_URL}/exam/api/proxy`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            method: payload.method,
            url: payload.url,
            body: payload.body,
            headers: payload.headers,
          }),
        });
        return response.json();
      },



      async cleanupContainer(sessionId: string): Promise<ApiResponse<void>> {
        try {
          const response = await fetch(`${BACKEND_URL}/exam/cleanup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
          });
          return handleApiResponse(response);
        } catch (error) {
          return {
            success: false,
            error: 'Failed to cleanup'
          };
        }
      }
    }


    interface FileItem {
      name: string;
      type: 'file' | 'folder';
      path: string;
    }
    
    export const fileService = {
      async listDirectory(sessionId: string, path: string = '/app'): Promise<FileItem[]> {
        try {
          const response = await fetch(`${BACKEND_URL}/exam/api/files/list?sessionId=${sessionId}&path=${encodeURIComponent(path)}`);
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || 'Failed to list directory');
          return data.files;
        } catch (error) {
          console.error('Error listing directory:', error);
          throw error;
        }
      },
    
      async getFileContent(sessionId: string, filePath: string, forceText: boolean = false): Promise<string> {
        try {
            const url = `${BACKEND_URL}/exam/api/files/content?sessionId=${sessionId}&filePath=${encodeURIComponent(filePath)}${forceText ? '' : '&isBinary=true'}`;
            
            console.log('Fetching file content from:', url);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error ${response.status}`);
            }
    
            const data = await response.json();
            
            console.log('Received response:', {
                success: data.success,
                isBinary: data.isBinary,
                length: data.length
            });
    
            if (!data.success) {
                throw new Error(data.error || 'Failed to get file content');
            }
    
            // Handle binary content
            if (data.isBinary) {
                if (forceText) {
                    // Attempt to convert binary to text
                    const textDecoder = new TextDecoder('utf-8', { fatal: false });
                    const cleanText = textDecoder.decode(Uint8Array.from(atob(data.content), c => c.charCodeAt(0)))
                        .replace(/[^\x20-\x7E\r\n\t]/g, '');
                    return cleanText;
                }
                // Return as binary string representation
                return data.content;
            }
    
            // Handle regular text content
            return data.content;
    
        } catch (error) {
            console.error('Error in getFileContent:', error);
            
            let errorMessage = 'Failed to get file content';
            if (error instanceof Error) {
                errorMessage = error.message.includes('Unexpected token') 
                    ? 'Invalid file format (try binary mode)'
                    : error.message;
            }
            
            throw new Error(errorMessage);
        }
    },
    
    async saveFile(sessionId: string, filePath: string, content: string | Uint8Array) {
      try {
        const response = await fetch(`${BACKEND_URL}/exam/api/files/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            filePath,
            content: typeof content === 'string' ? content : Array.from(content)
          })
        });
        
        const data = await response.json();
        if (!data.success) throw new Error(data.error);
        return data;
      } catch (error) {
        console.error('Error saving file:', error);
        throw error;
      }
    },
    
      async createFileOrFolder(
        sessionId: string, 
        path: string, 
        type: 'file' | 'folder'
      ): Promise<void> {
        try {
          const response = await fetch(`${BACKEND_URL}/exam/api/files/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, path, type })
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || `Failed to create ${type}`);
        } catch (error) {
          console.error(`Error creating ${type}:`, error);
          throw error;
        }
      }
    };
  