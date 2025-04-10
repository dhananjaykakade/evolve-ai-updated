// src/server.ts (backend)
import express from 'express';  
import Docker from 'dockerode'
import cors from 'cors';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { exec } from 'child_process';
import util,{promisify } from 'util';


const docker = new Docker();
const app = express();
const PORT = 9005;
const SANDBOX_DIR = path.join(__dirname, 'sandbox');

// Ensure sandbox directory exists
if (!fs.existsSync(SANDBOX_DIR)) {
  fs.mkdirSync(SANDBOX_DIR);
}

const EXECUTION_DIR = path.join(__dirname, 'executions');
const execPromise = util.promisify(exec);
const execAsync = promisify(exec);
// Ensure executions directory exists
if (!fs.existsSync(EXECUTION_DIR)) {
    fs.mkdirSync(EXECUTION_DIR, { recursive: true });
}

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));



app.get('/backend-health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'backend',
      timestamp: new Date().toISOString()
    });
  });
  
  // Proxy endpoint
  app.post('/api/proxy', async (req, res) => {
    try {
      const { method, url, body, headers } = req.body;
  
      // Validate input
      if (!method || !url) {
        return res.status(400).json({ error: 'Method and URL are required' });
      }
  
      // Special handling for frontend health checks
      if (url.includes('8082/health')) {
        return res.json({
          status: 'healthy',
          service: 'frontend',
          warning: 'Frontend health check returned HTML',
          timestamp: new Date().toISOString()
        });
      }
  
      // Normal proxy handling for other endpoints
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: body ? JSON.stringify(body) : undefined
      });
  
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return res.json(await response.json());
      }
      return res.send(await response.text());
      
    } catch (error) {
      console.error('Proxy error:', error);
      return res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Proxy error' 
      });
    }
  });
  

// Web execution endpoint
app.post('/execute/web', async (req, res) => {
  try {
    const { html, css, js } = req.body;

    // Validate input
    if (!html || typeof html !== 'string') {
      return res.status(400).json({ error: 'Invalid HTML content' });
    }

    // Create a unique sandbox ID
    const sandboxId = uuidv4();
    const sandboxPath = path.join(SANDBOX_DIR, sandboxId);
    fs.mkdirSync(sandboxPath);

    // Create the HTML file with embedded CSS and JS
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${css || ''}</style>
        </head>
        <body>${html}</body>
        <script>${js || ''}</script>
      </html>
    `;

    fs.writeFileSync(path.join(sandboxPath, 'index.html'), htmlContent);

    // In production, you would serve this from a static file server
    // For development, we'll return the combined content
    res.json({
      success: true,
      sandboxId,
      previewUrl: `/sandbox/${sandboxId}/index.html`,
      combined: htmlContent
    });

  } catch (error) {
    console.error('Web execution error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to execute web code'
    });
  }
});


app.post('/execute/node', async (req, res) => {
    console.log('Executing node');
    try {
        const { code, timeout = 5000 } = req.body;

        if (!code || typeof code !== 'string') {
            return res.status(400).json({ error: 'Invalid Node.js code' });
        }

        const executionId = uuidv4();
        const executionPath = path.join(EXECUTION_DIR, executionId);
        fs.mkdirSync(executionPath);

        const codePath = path.join(executionPath, 'code.js');
        fs.writeFileSync(codePath, code);

        // Ensure the Docker image exists
        await docker.pull('node:18-alpine');

        // Create and start Docker container
        const container = await docker.createContainer({
            Image: 'node:18-alpine',
            Cmd: ['node', '/app/code.js'],
            HostConfig: {
                Binds: [`${executionPath}:/app`],
                Memory: 100 * 1024 * 1024,
                MemorySwap: 200 * 1024 * 1024,
                CpuShares: 512,
                NetworkMode: 'none',
                AutoRemove: true
            },
            WorkingDir: '/app',
        });

        const startTime = Date.now();
        await container.start();

        // Handle timeout and execution together
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Execution timed out')), timeout)
        );

        const result = await Promise.race([container.wait(), timeoutPromise]);

        // Fetch logs
        const logs = await container.logs({ stdout: true, stderr: true });
        let output = logs.toString('utf8').trim();

        // Remove unwanted binary characters (optional)
        output = output.replace(/[^\x20-\x7E\n]/g, '');

        // Cleanup execution folder
        fs.rmSync(executionPath, { recursive: true, force: true });

        res.json({
            success: true,
            executionId,
            output,
            executionTime: Date.now() - startTime,
            exitCode: (result)?.StatusCode || 0
        });

    } catch (error) {
        if (error.message === 'Execution timed out') {
            return res.status(408).json({ success: false, error: 'Execution timed out' });
        }

        console.error('Node execution error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to execute Node.js code' });
    }
});
// Static files for sandbox (in production use a proper static file server)
app.use('/sandbox', express.static(SANDBOX_DIR));

// Add to your backend
function cleanupExecutions() {
    fs.readdirSync(EXECUTION_DIR).forEach(dir => {
      const dirPath = path.join(EXECUTION_DIR, dir);
      try {
        // Delete directories older than 1 hour
        if (Date.now() - fs.statSync(dirPath).birthtime.getTime() > 3600000) {
          fs.rmSync(dirPath, { recursive: true });
        }
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    });
  }
  
  // Run hourly cleanup
  setInterval(cleanupExecutions, 3600000);


  // Initialize container with proper shell setup
// Helper to create a new container
const activeContainers = new Map();

async function createContainer(sessionId) {
  try {
    // Check for existing container first
    const existing = activeContainers.get(sessionId);
    
    if (existing) {
      try {
        // Verify container still exists and is running
        const container = docker.getContainer(existing.id);
        const data = await container.inspect();
        
        if (data.State.Running) {
          console.log(`Reusing running container: ${existing.id}`);
          return existing;
        } else {
          console.log(`Restarting stopped container: ${existing.id}`);
          await container.start();
          return existing;
        }
      } catch (error) {
        console.log(`Removing invalid container reference: ${error.message}`);
        activeContainers.delete(sessionId);
      }
    }

    // Create new container with unique name
    const containerName = `sandbox-${sessionId}-${Date.now()}`;
    const container = await docker.createContainer({
      Image: 'node:18-alpine',
      name: containerName,
      Cmd: ['sh'],
      HostConfig: {
        Memory: 2 * 1024 * 1024 * 1024,
        MemorySwap: 4 * 1024 * 1024 * 1024,
        CpuShares: 1024,
        NetworkMode: 'bridge',
        AutoRemove: true,
        PortBindings: {
          '3000/tcp': [{ HostPort: '0' }]  // 🔹 '0' lets Docker assign an available port automatically
        },
        ExposedPorts: {
          '3000/tcp': {} // 🔹 Explicitly expose the port
        },
      },
      Tty: true,
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      OpenStdin: true,
      StdinOnce: false
    });

    const containerId = container.id;
    
    // Store container info
    const containerInfo = {
      container: container,
      id: containerId,
      name: containerName
    };
    
    activeContainers.set(sessionId, containerInfo);
    await container.start();

    // Setup environment
    const setupCommands = [
      `mkdir -p /app`,
      `chmod 777 /app`,
      `sh -c "echo 'export PS1=\\$ ' >> /etc/profile"`,
      `npm init -y --silent`,
      `npm install express --silent`
    ];

    // Execute setup commands directly using docker.exec
    for (const cmd of setupCommands) {
      try {
        const exec = await container.exec({
          Cmd: ['sh', '-c', cmd],
          AttachStdout: true,
          AttachStderr: true
        });
        
        const stream = await exec.start({});
        await new Promise((resolve) => {
          stream.on('end', resolve);
          stream.resume(); // Ensure stream flows
        });
      } catch (error) {
        console.warn(`Setup command failed: ${cmd}`, error.message);
      }
    }

    console.log(`Created new container: ${containerId}`);
    return containerInfo;

  } catch (error) {
    console.error('Container creation failed:', error);
    
    // Handle name conflicts
    if (error.statusCode === 409) {
      console.log('Container name conflict, retrying with random name...');
      return createContainer(uuidv4()); // Try with new session ID
    }
    
    throw error;
  }
}
const stripAnsi = (str) => str.replace(/\x1B\[[0-9;]*[mGKH]/g, '');
// Fixed command execution endpoint
app.post('/execute/command', async (req, res) => {
  try {
    const { command } = req.body;
    const sessionId = req.headers['x-session-id'] || 'default';

    if (!command || typeof command !== 'string') {
      return res.status(400).json({ error: 'Valid command is required' });
    }

    // Get or create container
    let containerInfo = activeContainers.get(sessionId);
    if (!containerInfo) {
      console.log(`No container found for session ${sessionId}, creating new one...`);
      containerInfo = await createContainer(sessionId);
    }

    // Sanitize command
    const sanitizedCmd = command
      .replace(/[;&|$`<>]/g, '')
      .replace(/'/g, "'\\''")
      .trim();

    // Create an exec instance with TTY enabled
    const exec = await containerInfo.container.exec({
      Cmd: ['sh', '-c', `cd /app && ${sanitizedCmd}`],
      AttachStdout: true,
      AttachStderr: true,
      Tty: false  // This prevents weird control characters
    });

    let output = '';
    let errorOutput = '';

    // Start execution
    const stream = await exec.start({ hijack: true, stdin: true });

    await new Promise((resolve) => {
      stream.on('data', (chunk) => {
        output += chunk.toString('utf-8'); // Ensure proper encoding
      });

      stream.on('error', (err) => {
        errorOutput += err.toString();
      });

      stream.on('end', resolve);
      stream.resume(); // Ensure stream flows properly
    });

    // Trim and clean response output
    console.log("this is input and output",output,errorOutput)
    res.json({
      success: true,
      output: stripAnsi(output).trim(),
      error: stripAnsi(errorOutput).trim() || null
    });

  } catch (error) {
    console.error('Command execution failed:', error);

    if (error.message.includes('No such container')) {
      activeContainers.delete(sessionId);
      return res.status(400).json({ 
        success: false,
        error: 'Container no longer exists - please create a new session'
      });
    }

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// File system operations
app.post('/files', async (req, res) => {  
  try {
    const { files } = req.body;
    const sessionId = req.headers['x-session-id'] || 'default';
    const containerId = activeContainers[sessionId];

    if (!containerId) {
      return res.status(400).json({ error: 'No active container for session' });
    }

    // Save files to container
    for (const file of files) {
      if (file.type === 'file') {
        await execAsync(`docker exec ${containerId} sh -c "echo '${file.content.replace(/'/g, "'\\''")}' > /app/${file.name}"`);
      } else if (file.type === 'folder') {
        await execAsync(`docker exec ${containerId} mkdir -p /app/${file.name}`);
      }
    }

    res.json({ success: true });

  } catch (error) {
    console.error('File operation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save files'
    });
  }
});

// Cleanup endpoint
app.post('/cleanup', async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (sessionId) {
      const containerInfo = activeContainers.get(sessionId);
      if (containerInfo) {
        try {
          await containerInfo.container.stop();
        } catch (error) {
          console.warn('Error stopping container:', error);
        }
        activeContainers.delete(sessionId);
      }
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Failed to cleanup container' 
    });
  }
});


async function getAvailablePort(startPort = 3000, endPort = 4000) {
  for (let port = startPort; port <= endPort; port++) {
    const inUse = Array.from(activeContainers.values()).some(
      info => info.port === port
    );
    if (!inUse) {
      return port;
    }
  }
  throw new Error('No available ports in range');
}

// Helper to execute command in container
async function execCommand(container, command) {
  return new Promise((resolve, reject) => {
    container.exec(
      {
        Cmd: ['sh', '-c', command],
        AttachStdout: true,
        AttachStderr: true,
      },
      (err, exec) => {
        if (err) return reject(`Exec creation error: ${err.message}`);

        exec.start({}, (err, stream) => {
          if (err) return reject(`Exec start error: ${err.message}`);

          let output = '';
          let errorOutput = '';

          stream.on('data', (chunk) => {
            output += chunk.toString();
          });

          stream.on('error', (err) => {
            errorOutput += err.toString();
          });

          stream.on('end', () => {
            if (errorOutput) {
              reject(`Command Execution Failed: ${errorOutput}`);
            } else {
              resolve(output.trim());
            }
          });
        });
      }
    );
  });
}


// Start Node.js server
app.post('/api/node-server/start', async (req, res) => {
  const { code, sessionId } = req.body;
  console.log(`Received request to start server: sessionId=${sessionId}`);

  try {
    let containerInfo = activeContainers.get(sessionId);
    let container = containerInfo?.container;
    let isNewContainer = false;

    if (!container) {
      console.log(`No container in memory. Checking Docker for existing container...`);

      try {
        const containers = await docker.listContainers({ all: true });
        const existingContainer = containers.find(c => 
          c.Names.some(name => name === `/node-sandbox-${sessionId}`)
        );

        if (existingContainer) {
          console.log(`Found existing container: ${existingContainer.Id}`);
          container = docker.getContainer(existingContainer.Id);
          
          if (existingContainer.State !== 'running') {
            console.log(`Starting stopped container: ${existingContainer.Id}`);
            await container.start();
          }
          
          containerInfo = { container };
          activeContainers.set(sessionId, containerInfo);
        }
      } catch (error) {
        console.log(`Error checking for existing containers: ${error.message}`);
      }

      if (!container) {
        console.log(`Creating new container for sessionId=${sessionId}`);

        try {
          container = await docker.createContainer({
            Image: 'node:18-alpine',
            name: `node-sandbox-${sessionId}`,
            HostConfig: { 
              AutoRemove: true,
              PortBindings: {
                '3000/tcp': [{ HostPort: '0' }] // 🔹 Automatically assigns a free port
              }
            },
            ExposedPorts: {
              '3000/tcp': {} // 🔹 Explicitly expose the port
            },
            Cmd: ['tail', '-f', '/dev/null'],
            WorkingDir: '/app',
            Tty: true
          });

          await container.start();
          isNewContainer = true;
          console.log(`Container started successfully: ${container.id}`);

          containerInfo = { container };
          activeContainers.set(sessionId, containerInfo);

          console.log(`Installing Node.js and npm in container`);
          await execCommand(container, 'apk add --no-cache nodejs npm');
        } catch (error) {
          if (error.statusCode === 409) {
            console.log(`Container name conflict, using random name instead`);
            container = await docker.createContainer({
              Image: 'node:18-alpine',
              HostConfig: { AutoRemove: true },
              Cmd: ['tail', '-f', '/dev/null'],
              WorkingDir: '/app',
              Tty: true
            });
            await container.start();
            isNewContainer = true;
            containerInfo = { container };
            activeContainers.set(sessionId, containerInfo);
            await execCommand(container, 'apk add --no-cache nodejs npm');
          } else {
            throw error;
          }
        }
      }
    }

    // 🔥 Retrieve the exposed port dynamically
    const data = await container.inspect();
    const ports = data.NetworkSettings.Ports || {};
    const hostPort = ports['3000/tcp']?.[0]?.HostPort;
    console.log(hostPort)
    
    if (!hostPort) {
      throw new Error('Failed to retrieve mapped host port.');
    }

    containerInfo.port = hostPort;
    activeContainers.set(sessionId, containerInfo);

    console.log(`Using port ${hostPort} for sessionId=${sessionId}`);

    // Server code setup
    const serverCode = code || `
      const express = require('express');
      const app = express();
      const port = process.env.PORT || 3000;
      app.get('/', (req, res) => res.send('Hello from Node.js server!'));
      app.listen(port, () => console.log(\`Server running on port \${port}\`));
    `;

    console.log(`Setting up container environment...`);
    await execCommand(container, `mkdir -p /app`);
    await execCommand(container, `echo "${serverCode.replace(/"/g, '\\"')}" > /app/server.js`);

    const packageJson = JSON.stringify({
      name: "node-sandbox",
      version: "1.0.0",
      main: "server.js",
      dependencies: {
        express: "^4.18.2",
        cors: "^2.8.5"
      }
    });

    await execCommand(container, `echo '${packageJson.replace(/'/g, "'\\''")}' > /app/package.json`);

    if (isNewContainer) {
      console.log(`Installing npm dependencies...`);
      await execCommand(container, 'cd /app && npm install');
    }

    console.log(`Starting Node.js server...`);
    await execCommand(container, `pkill -f "node server.js" || true`);
    await execCommand(container, `PORT=3000 nohup node /app/server.js > /app/output.log 2>&1 &`);

    console.log(`Server started successfully for sessionId=${sessionId}`);
    res.json({ 
      success: true, 
      port: hostPort,
      containerId: container.id,
      message: `Server running on port ${hostPort}`
    });

  } catch (error) {
    console.error(`Error starting server: sessionId=${sessionId}`, error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});



// Stop Node.js server
app.post('/api/node-server/stop', async (req, res) => {
  const { sessionId } = req.body;

  try {
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    const containerInfo = activeContainers.get(sessionId);
    if (!containerInfo) {
      return res.json({
        success: true,
        output: 'No active server found for this session'
      });
    }

    const { container, id: containerId } = containerInfo;

    try {
      // First try to gracefully stop the Node.js process
      try {
        const exec = await container.exec({
          Cmd: ['sh', '-c', "pkill -f 'node server.js' || true"],
          AttachStdout: true,
          AttachStderr: true
        });
        
        const stream = await exec.start({});
        await new Promise((resolve) => {
          stream.on('end', resolve);
          stream.resume();
        });
      } catch (error) {
        console.warn('Graceful stop failed, trying force stop:', error.message);
      }

      // Then stop the container itself
      await container.stop();
      console.log(`Container ${containerId} stopped successfully`);

      // Remove from active containers
      activeContainers.delete(sessionId);

      return res.json({
        success: true,
        output: 'Server stopped successfully',
        containerId
      });

    } catch (error) {
      // If stop fails, try to kill the container
      if (error.statusCode === 304 || error.message.includes('already stopped')) {
        console.log(`Container ${containerId} was already stopped`);
      } else {
        console.error(`Error stopping container ${containerId}, trying to kill:`, error);
        try {
          await container.kill();
          console.log(`Container ${containerId} killed successfully`);
        } catch (killError) {
          console.error(`Failed to kill container ${containerId}:`, killError);
        }
      }

      // Remove from active containers regardless
      activeContainers.delete(sessionId);

      return res.json({
        success: true,
        output: 'Server stopped (forced)',
        containerId
      });
    }

  } catch (error) {
    console.error('Error stopping server:', error);
    
    // Clean up active containers reference if something went wrong
    if (sessionId && activeContainers.has(sessionId)) {
      activeContainers.delete(sessionId);
    }

    return res.status(500).json({
      success: false,
      error: error.message,
      output: `Failed to stop server: ${error.message}`
    });
  }
});
// Get server status
app.get('/api/node-server/status/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const containerInfo = activeContainers.get(sessionId);

  if (!containerInfo) {
    return res.json({
      running: false,
      port: null
    });
  }

  res.json({
    running: true,
    port: containerInfo.port
  });
});

// Cleanup all containers on server shutdown


// Backend API
// Backend API (server.ts)
app.post('/api/files/save', async (req, res) => {
  const tempDir = path.join(process.cwd(), 'temp');
  
  try {
    const { sessionId, filePath, content } = req.body;
    console.log("this is file path",filePath)

    if (!sessionId || !filePath || content === undefined) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const containerInfo = activeContainers.get(sessionId);
    if (!containerInfo) {
      return res.status(404).json({ error: 'Container not found' });
    }

    // Ensure temp directory exists
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Create temporary file
    const tempPath = path.join(tempDir, `${Date.now()}_${path.basename(filePath)}`);
    await fs.promises.writeFile(tempPath, content);

    // Get container object
    const container = containerInfo.container;

    // Method 1: Using exec to echo content directly
    const exec = await container.exec({
      Cmd: ['sh', '-c', `mkdir -p "$(dirname "${filePath}")" && cat > "${filePath}"`],
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true
    });

    const stream = await exec.start({ hijack: true, stdin: true });
    stream.write(content);
    stream.end();

    // Wait for command to complete
    await new Promise((resolve) => {
      stream.on('end', resolve);
    });

    // Clean up
    await fs.promises.unlink(tempPath);

    res.json({ success: true });
  } catch (error) {
    console.error('Error saving file:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to save file' 
    });
  }
});

// Frontend handler
// Create file/folder API
app.post('/api/files/create', async (req, res) => {
  try {
    const { sessionId, path: filePath, type } = req.body;

    if (!sessionId || !filePath || !type) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const containerInfo = activeContainers.get(sessionId);
    if (!containerInfo) {
      return res.status(404).json({ error: 'Container not found' });
    }

    const exec = await containerInfo.container.exec({
      Cmd: [
        'sh', 
        '-c', 
        type === 'file' 
          ? `touch "${filePath}" && chmod 666 "${filePath}"`
          : `mkdir -p "${filePath}"`
      ],
      AttachStdout: true,
      AttachStderr: true
    });

    const stream = await exec.start({});
    await new Promise((resolve) => stream.on('end', resolve));

    res.json({ 
      success: true, 
      message: `${type === 'file' ? 'File' : 'Folder'} created successfully` 
    });
  } catch (error) {
    console.error('Error creating file/folder:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to create file/folder' 
    });
  }
});

// Get file content API
app.get('/api/files/content', async (req, res) => {
  try {
    const { sessionId, filePath, isBinary } = req.query;


    console.log(filePath)
    // Input validation
    if (!sessionId || !filePath) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Enhanced path sanitization
    const normalizedPath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, '');
    console.log(normalizedPath)
    if (normalizedPath !== filePath) {
      return res.status(400).json({ error: 'Invalid file path' });
    }

    const containerInfo = activeContainers.get(sessionId);
    if (!containerInfo) {
      return res.status(404).json({ error: 'Container not found' });
    }

    // Execute cat command in container
    const exec = await containerInfo.container.exec({
      Cmd: ['cat', filePath],
      AttachStdout: true,
      AttachStderr: true
    });

    const chunks = [];
    let errorOutput = '';
    const stream = await exec.start({});

    await new Promise((resolve, reject) => {
      stream.on('data', (chunk) => {
        if (chunk.stderr) {
          errorOutput += chunk.toString('utf8');
        } else {
          chunks.push(chunk);
        }
      });

      stream.on('end', () => {
        if (errorOutput) {
          reject(new Error(errorOutput.trim()));
        } else {
          resolve();
        }
      });

      stream.on('error', reject);
    });

    const fileBuffer = Buffer.concat(chunks);
    
    // Debug output (hex dump of first 64 bytes)
    console.log('File content (hex):', fileBuffer.subarray(0, 64).toString('hex'));

    // Determine if content is binary (heuristic check)
    const isActuallyBinary = isBinary === 'true' || 
                           fileBuffer.some(byte => byte < 32 && byte !== 10 && byte !== 13 && byte !== 9);

    if (isActuallyBinary) {
      // Return binary data as base64
      res.json({ 
        success: true, 
        content: fileBuffer.toString('base64').trim(),
        isBinary: true,
        length: fileBuffer.length
      });
    } else {
      // Return text data with cleaned encoding
      const textContent = fileBuffer.toString('utf8').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
      res.json({ 
        success: true, 
        content: textContent,
        isBinary: false,
        length: textContent.length
      });
    }

  } catch (error) {
    console.error('Error getting file content:', error);
    
    // Enhanced error handling
    const errorMessage = error.message || 'Failed to get file content';
    let statusCode = 500;
    
    if (errorMessage.includes('No such file')) {
      statusCode = 404;
    } else if (errorMessage.includes('Permission denied')) {
      statusCode = 403;
    }

    res.status(statusCode).json({ 
      success: false, 
      error: errorMessage
    });
  }
});
// List directory API
app.get('/api/files/list', async (req, res) => {
  try {
    const { sessionId, path: dirPath = '/app' } = req.query;

    if (!sessionId) {
      return res.status(400).json({ error: 'Missing sessionId' });
    }

    const containerInfo = activeContainers.get(sessionId);
    if (!containerInfo) {
      return res.status(404).json({ error: 'Container not found' });
    }

    const exec = await containerInfo.container.exec({
      Cmd: ['sh', '-c', `ls -p "${dirPath}" | grep -v /`], // Files only
      AttachStdout: true,
      AttachStderr: true
    });

    let files = '';
    const stream = await exec.start({});
    await new Promise((resolve) => {
      stream.on('data', (chunk) => files += chunk.toString('utf8'));
      stream.on('end', resolve);
    });

    const execDirs = await containerInfo.container.exec({
      Cmd: ['sh', '-c', `ls -p "${dirPath}" | grep /`], // Directories only
      AttachStdout: true,
      AttachStderr: true
    });

    let dirs = '';
    const dirStream = await execDirs.start({});
    await new Promise((resolve) => {
      dirStream.on('data', (chunk) => dirs += chunk.toString('utf8'));
      dirStream.on('end', resolve);
    });

    const fileList = files.split('\n').filter(Boolean).map(name => ({
      name,
      type: 'file',
      path: path.join(dirPath, name) // ✅ Now path is defined
    }));

    const dirList = dirs.split('\n').filter(Boolean).map(name => ({
      name: name.replace(/\/$/, ''),
      type: 'folder',
      path: path.join(dirPath, name)
    }));

    res.json({ 
      success: true, 
      files: [...dirList, ...fileList] 
    });
  } catch (error) {
    console.error('Error listing directory:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to list directory' 
    });
  }
});
// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  setInterval(cleanupExecutions, 3600000); // Hourly cleanup
});

// Cleanup old executions
