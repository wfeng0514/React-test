import React, { useState, useEffect } from 'react';
import axios from 'axios';

export const ServerDashboard = () => {
  const [status, setStatus] = useState('loading');
  const [logs, setLogs] = useState([]);

  // 检查服务状态
  const checkStatus = async () => {
    try {
      const res = await axios.get('/api/server/status');
      setStatus(res.data.running ? 'running' : 'stopped');
    } catch {
      setStatus('stopped');
    }
  };

  // 启动服务
  const startServer = async () => {
    setStatus('starting');
    try {
      await axios.post('/api/server/start');
      setStatus('running');
    } catch (err) {
      setStatus('error');
    }
  };

  // 停止服务
  const stopServer = async () => {
    setStatus('stopping');
    try {
      await axios.post('/api/server/stop');
      setStatus('stopped');
    } catch (err) {
      setStatus('error');
    }
  };

  // 建立日志WebSocket连接
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001/logs');

    ws.onmessage = (event) => {
      setLogs((prev) => [...prev.slice(-100), event.data]);
    };

    return () => ws.close();
  }, []);

  return (
    <div className="server-dashboard">
      <div className="control-buttons">
        <button onClick={startServer} disabled={status === 'running' || status === 'starting'} className="start-btn">
          {status === 'starting' ? 'Starting...' : 'Start Server'}
        </button>

        <button onClick={stopServer} disabled={status !== 'running'} className="stop-btn">
          {status === 'stopping' ? 'Stopping...' : 'Stop Server'}
        </button>
      </div>

      <div className="status-indicator">
        Status: <span className={`status-${status}`}>{status}</span>
      </div>

      <div className="log-container">
        <h3>Server Logs:</h3>
        <pre>{logs.join('\n')}</pre>
      </div>
    </div>
  );
};
