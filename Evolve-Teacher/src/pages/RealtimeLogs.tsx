import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { AlertCircle, Clock, UserCheck, Filter, RefreshCw } from 'lucide-react';
import axios from 'axios';

// Real-time logs component that can be integrated into existing dashboard
const RealtimeLogs = ({ testId, baseUrl = 'http://localhost:9001' }) => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterText, setFilterText] = useState('');
  const [filterStudent, setFilterStudent] = useState('');
  const [students, setStudents] = useState([]);
  const [highlightKeywords, setHighlightKeywords] = useState(['warning', 'suspicious', 'error']);
  const [isConnected, setIsConnected] = useState(false);
  const socket = useRef(null);
  const logsEndRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Fetch initial logs for the test
  useEffect(() => {
    if (!testId) return;
    
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${baseUrl}/notification/tests/${testId}/logs`);
        if (response.data.success) {
          setLogs(response.data.data);
          
          // Extract unique students from logs
          const uniqueStudents = [...new Set(
            response.data.data
              .map(log => log.studentName)
              .filter(Boolean)
          )];
          setStudents(uniqueStudents);
        } else {
          console.error('Failed to fetch logs:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLogs();
  }, [testId, baseUrl]);

  // Connect to WebSocket for real-time updates
  useEffect(() => {
    if (!testId) return;
    
    const connectWebSocket = () => {
// For your proxied microservice
const backendUrl = 'http://localhost:8003'; // This is the proxied URL that clients should connect to
const socketPath = '/notification';

// Determine protocol (ws or wss based on if the page is served over https)
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

// Create WebSocket connection - convert http: to ws: and https: to wss:
const ws = new WebSocket(`${backendUrl.replace(/^http/, 'ws')}${socketPath}`);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        
        // Send subscription message to server for this specific test
        ws.send(JSON.stringify({
          type: 'subscribe',
          testId: testId
        }));
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'log') {
            setLogs(prevLogs => {
              // Only add logs for the current test
              if (data.data.testId === testId) {
                // Improved duplicate detection using _id, timestamp, and message content
                const isDuplicate = prevLogs.some(log => (
                  // Check by ID if available
                  (log._id && log._id === data.data._id) || 
                  // Or by matching timestamp and message (backup check)
                  (log.timestamp === data.data.timestamp && 
                   log.message === data.data.message &&
                   log.studentId === data.data.studentId)
                ));
                
                if (!isDuplicate) {
                  return [...prevLogs, data.data];
                }
              }
              return prevLogs;
            });
            
            // If this is a new student, add them to the students list
            if (data.data.studentName && !students.includes(data.data.studentName)) {
              setStudents(prev => [...prev, data.data.studentName]);
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        // Try to reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };
      
      socket.current = ws;
    };
    
    connectWebSocket();
    
    // Cleanup on unmount or when testId changes
    return () => {
      if (socket.current) {
        socket.current.close();
      }
    };
  }, [testId, baseUrl, students]);

  // Auto-scroll to latest log entries if enabled
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  // Filter logs based on filter criteria
  const filteredLogs = logs.filter(log => {
    // If both text and student filters are empty, show all logs
    if (!filterText && !filterStudent) return true;
    
    // Filter by text content
    const textMatch = !filterText || 
      log.message.toLowerCase().includes(filterText.toLowerCase());
    
    // Filter by student
    const studentMatch = !filterStudent || 
      (log.studentName && log.studentName.toLowerCase() === filterStudent.toLowerCase());
    
    return textMatch && studentMatch;
  });

  // Get stats from logs
  const getStats = () => {
    if (!logs.length) return { warnings: 0, students: 0, events: 0 };
    
    const warnings = logs.filter(log => 
      log.message.toLowerCase().includes('warning') || 
      log.message.toLowerCase().includes('suspicious')
    ).length;
    
    const uniqueStudents = new Set(logs.map(log => log.studentId).filter(Boolean)).size;
    
    return { 
      warnings, 
      students: uniqueStudents,
      events: logs.length
    };
  };

  // Function to clear logs
  const clearLogs = () => {
    setLogs([]);
  };

  // Highlight keywords in log message if specified
  const highlightMessage = (message) => {
    if (highlightKeywords.length === 0 || !message) return message;
    
    let parts = [message];
    highlightKeywords.forEach(keyword => {
      if (!keyword.trim()) return;
      
      parts = parts.flatMap(part => {
        if (typeof part !== 'string') return [part];
        const splitParts = part.split(new RegExp(`(${keyword})`, 'gi'));
        return splitParts.map((text, i) => 
          text.toLowerCase() === keyword.toLowerCase() && i % 2 === 1 
            ? <mark key={i} className="bg-yellow-200 px-1 rounded">{text}</mark>
            : text
        );
      });
    });
    
    return parts;
  };

  // Log item component to display individual log entries
  const LogItem = ({ log }) => {
    const timestamp = new Date(log.timestamp);
    const formattedTime = format(timestamp, 'HH:mm:ss');
    
    // Determine severity level based on message content
    const getSeverityClass = () => {
      if (!log.message) return 'border-l-4 border-gray-200';
      
      const message = log.message.toLowerCase();
      if (message.includes('warning') || message.includes('suspicious')) 
        return 'border-l-4 border-yellow-400 bg-yellow-50';
      if (message.includes('error') || message.includes('terminated')) 
        return 'border-l-4 border-red-400 bg-red-50';
      if (message.includes('submitted') || message.includes('started')) 
        return 'border-l-4 border-green-400 bg-green-50';
      return 'border-l-4 border-gray-200';
    };
    
    return (
      <div className={`p-3 mb-2 ${getSeverityClass()}`}>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="text-sm text-gray-800">{highlightMessage(log.message)}</p>
            <div className="flex items-center mt-1 text-xs text-gray-500">
              <UserCheck size={14} className="mr-1" />
              <span className="mr-3">{log.studentName || 'Unknown'}</span>
              <Clock size={14} className="mr-1" />
              <span>{formattedTime}</span>
            </div>
          </div>
          {log.message && log.message.toLowerCase().includes('warning') && (
            <AlertCircle size={20} className="text-yellow-500 flex-shrink-0" />
          )}
        </div>
      </div>
    );
  };

  const stats = getStats();

  return (
    <div className="space-y-5">
      {/* Connection status and stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
          <span className="text-sm text-gray-600">
            {isConnected ? 'Real-time monitoring active' : 'Monitoring offline'}
          </span>
        </div>
        <button
          onClick={clearLogs}
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
        >
          <RefreshCw size={16} className="mr-1" />
          Clear logs
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">Total Events</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.events}</dd>
            </dl>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">Active Students</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.students}</dd>
            </dl>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">Warnings</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.warnings}</dd>
            </dl>
          </div>
        </div>
      </div>

      {/* Filter controls */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <span className="text-gray-500 mr-3"><Filter size={20} /></span>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Log Filters</h3>
          </div>
          <div className="mt-3 flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <label htmlFor="filter" className="block text-sm font-medium text-gray-700">
                Filter Content
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="filter"
                  id="filter"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Filter by keyword..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="student" className="block text-sm font-medium text-gray-700">
                Filter Student
              </label>
              <div className="mt-1">
                <select
                  id="student"
                  name="student"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={filterStudent}
                  onChange={(e) => setFilterStudent(e.target.value)}
                >
                  <option value="">All Students</option>
                  {students.map((student, index) => (
                    <option key={index} value={student}>{student}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="highlight" className="block text-sm font-medium text-gray-700">
                Highlight Keywords
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="highlight"
                  id="highlight"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="comma separated"
                  value={highlightKeywords.join(', ')}
                  onChange={(e) => setHighlightKeywords(e.target.value.split(',').map(k => k.trim()))}
                />
              </div>
            </div>
          </div>
          <div className="mt-3">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                checked={autoScroll}
                onChange={() => setAutoScroll(!autoScroll)}
              />
              <span className="ml-2 text-sm text-gray-600">Auto-scroll to new logs</span>
            </label>
          </div>
        </div>
      </div>

      {/* Logs container */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <div className="overflow-y-auto max-h-96 pr-2">
            {isLoading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading logs...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-gray-500">No logs found</p>
              </div>
            ) : (
              <>
                {filteredLogs.map((log, index) => (
                  <LogItem key={log._id || index} log={log} />
                ))}
                <div ref={logsEndRef} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealtimeLogs;