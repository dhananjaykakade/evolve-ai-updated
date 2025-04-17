let socket: WebSocket | null = null;
let pendingLogs: any[] = [];

export const connectWebSocket = (studentId: string, studentName: string, testId: string) => {
  socket = new WebSocket(`ws://localhost:8003`);

  socket.onopen = () => {
    console.log('✅ WebSocket connected');
    // Flush any pending logs
    pendingLogs.forEach((log) => {
      socket?.send(JSON.stringify(log));
    });
    pendingLogs = [];
  };

  socket.onerror = (error) => {
    console.error('🚨 WebSocket error:', error);
  };

  socket.onclose = () => {
    console.log('❌ WebSocket disconnected');
  };
};

export const sendLog = (message: string, studentId: string, studentName: string, testId: string) => {
  const logData = {
    studentId,
    studentName,
    testId,
    message,
    timestamp: new Date().toISOString()
  };

  if (!socket || socket.readyState === WebSocket.CLOSED) {
    console.warn('🔄 WebSocket not connected, reconnecting...');
    pendingLogs.push(logData);
    connectWebSocket(studentId, studentName, testId);
    return;
  }

  if (socket.readyState === WebSocket.CONNECTING) {
    console.warn('⏳ WebSocket still connecting, queuing log...');
    pendingLogs.push(logData);
    return;
  }

  try {
    socket.send(JSON.stringify(logData));
  } catch (error) {
    console.error('❌ Error sending log:', error);
  }
};

export const disconnectWebSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
    pendingLogs = [];
  }
};
