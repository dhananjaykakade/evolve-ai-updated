
import { FileSystemItem, FileType, FolderType } from '@/components/FileExplorer';

// Default files for various test types
export const createDefaultFiles = (testType: string): FileSystemItem[] => {
  switch (testType) {
    case 'frontend':
      return [
        {
          id: 'file-html',
          name: 'index.html',
          content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Frontend Test</title>
</head>
<body>
  <div id="app">
    <h1>Hello World</h1>
    <p>Edit the files to complete your test.</p>
  </div>
</body>
</html>`,
          type: 'file',
          language: 'html'
        },
        {
          id: 'file-css',
          name: 'styles.css',
          content: `body {
  font-family: Arial, sans-serif;
  line-height: 1.6;
  margin: 0;
  padding: 20px;
  color: #333;
}

h1 {
  color: #0066cc;
}`,
          type: 'file',
          language: 'css'
        },
        {
          id: 'file-js',
          name: 'script.js',
          content: `// Your JavaScript code here
console.log('Hello from script.js');

document.addEventListener('DOMContentLoaded', () => {
  // DOM is ready
});`,
          type: 'file',
          language: 'javascript'
        }
      ];
      
    case 'backend':
      return [
        {
          id: 'file-index',
          name: 'index.js',
          content: `// Express server setup
const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

// Define routes below
app.get('/', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Start server
app.listen(port, () => {
  console.log(\`Server running on port \${port}\`);
});`,
          type: 'file',
          language: 'javascript'
        },
        {
          id: 'folder-routes',
          name: 'routes',
          type: 'folder',
          children: [
            {
              id: 'file-users',
              name: 'users.js',
              content: `// User routes
const express = require('express');
const router = express.Router();

// Get all users
router.get('/', (req, res) => {
  res.json([
    { id: 1, name: 'User 1' },
    { id: 2, name: 'User 2' }
  ]);
});

// Get user by ID
router.get('/:id', (req, res) => {
  res.json({ id: req.params.id, name: \`User \${req.params.id}\` });
});

module.exports = router;`,
              type: 'file',
              language: 'javascript'
            }
          ]
        },
        {
          id: 'file-package',
          name: 'package.json',
          content: `{
  "name": "backend-test",
  "version": "1.0.0",
  "description": "Backend coding test",
  "main": "index.js",
  "dependencies": {
    "express": "^4.18.2"
  }
}`,
          type: 'file',
          language: 'json'
        }
      ];
      
    case 'fullstack':
      return [
        {
          id: 'folder-frontend',
          name: 'frontend',
          type: 'folder',
          children: [
            {
              id: 'file-html',
              name: 'index.html',
              content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fullstack App</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div id="app">
    <h1>Fullstack Application</h1>
    <div id="users">Loading users...</div>
  </div>
  <script src="app.js"></script>
</body>
</html>`,
              type: 'file',
              language: 'html'
            },
            {
              id: 'file-css',
              name: 'styles.css',
              content: `body {
  font-family: Arial, sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

#users {
  margin-top: 20px;
}

.user-card {
  border: 1px solid #ddd;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
}`,
              type: 'file',
              language: 'css'
            },
            {
              id: 'file-js',
              name: 'app.js',
              content: `// Frontend JavaScript
async function fetchUsers() {
  try {
    const response = await fetch('/api/users');
    const users = await response.json();
    
    const usersElement = document.getElementById('users');
    usersElement.innerHTML = '';
    
    users.forEach(user => {
      const userCard = document.createElement('div');
      userCard.className = 'user-card';
      userCard.innerHTML = \`<h3>\${user.name}</h3><p>ID: \${user.id}</p>\`;
      usersElement.appendChild(userCard);
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    document.getElementById('users').innerHTML = 'Error loading users';
  }
}

document.addEventListener('DOMContentLoaded', fetchUsers);`,
              type: 'file',
              language: 'javascript'
            }
          ]
        },
        {
          id: 'folder-backend',
          name: 'backend',
          type: 'folder',
          children: [
            {
              id: 'file-server',
              name: 'server.js',
              content: `// Express server setup
const express = require('express');
const app = express();
const port = 3000;
const usersRoutes = require('./routes/users');

app.use(express.json());
app.use(express.static('../frontend'));

// API routes
app.use('/api/users', usersRoutes);

// Catch-all route to serve frontend
app.get('*', (req, res) => {
  res.sendFile('index.html', { root: '../frontend' });
});

app.listen(port, () => {
  console.log(\`Server running on port \${port}\`);
});`,
              type: 'file',
              language: 'javascript'
            },
            {
              id: 'folder-routes',
              name: 'routes',
              type: 'folder',
              children: [
                {
                  id: 'file-users-route',
                  name: 'users.js',
                  content: `// User routes
const express = require('express');
const router = express.Router();

const users = [
  { id: 1, name: 'Alice Johnson' },
  { id: 2, name: 'Bob Smith' },
  { id: 3, name: 'Charlie Brown' }
];

router.get('/', (req, res) => {
  res.json(users);
});

router.get('/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

module.exports = router;`,
                  type: 'file',
                  language: 'javascript'
                }
              ]
            }
          ]
        },
        {
          id: 'file-package-json',
          name: 'package.json',
          content: `{
  "name": "fullstack-test",
  "version": "1.0.0",
  "description": "Fullstack coding test",
  "main": "backend/server.js",
  "scripts": {
    "start": "node backend/server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}`,
          type: 'file',
          language: 'json'
        }
      ];
      
    default:
      // Default to frontend
      return createDefaultFiles('frontend');
  }
};

// Find file by ID in the file system
export const findFileById = (
  files: FileSystemItem[],
  id: string
): FileType | null => {
  for (const item of files) {
    if (item.id === id && item.type === 'file') {
      return item as FileType;
    } else if (item.type === 'folder') {
      const found = findFileById((item as FolderType).children, id);
      if (found) return found;
    }
  }
  return null;
};

// Extract HTML, CSS, and JS content for the preview
export const extractPreviewContent = (
  files: FileSystemItem[]
): { html: string; css: string; js: string } => {
  let html = '';
  let css = '';
  let js = '';

  // Helper function to search through all files recursively
  const searchFiles = (items: FileSystemItem[]) => {
    for (const item of items) {
      if (item.type === 'file') {
        const file = item as FileType;
        
        if (file.name.endsWith('.html')) {
          html = file.content;
        } else if (file.name.endsWith('.css')) {
          css += file.content + '\n';
        } else if (file.name.endsWith('.js')) {
          js += file.content + '\n';
        }
      } else if (item.type === 'folder') {
        searchFiles((item as FolderType).children);
      }
    }
  };

  searchFiles(files);
  return { html, css, js };
};

// Update a file by ID with new content
export const updateFileContent = (
  files: FileSystemItem[],
  fileId: string,
  newContent: string
): FileSystemItem[] => {
  return files.map(item => {
    if (item.id === fileId && item.type === 'file') {
      return { ...item, content: newContent };
    } else if (item.type === 'folder') {
      const folderItem = item as FolderType;
      return {
        ...folderItem,
        children: updateFileContent(folderItem.children, fileId, newContent)
      };
    }
    return item;
  });
};
