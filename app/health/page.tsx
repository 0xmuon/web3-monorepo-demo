'use client';

import { useState, useEffect } from 'react';

export default function HealthCheck() {
  const [backendStatus, setBackendStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [backendData, setBackendData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        
        if (response.ok) {
          setBackendStatus('ok');
          setBackendData(data);
        } else {
          setBackendStatus('error');
          setError(data.error || 'Unknown error');
        }
      } catch (err) {
        setBackendStatus('error');
        setError(err instanceof Error ? err.message : 'Failed to connect to backend');
      }
    };

    checkBackend();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Health Check</h1>
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Frontend</h2>
        <p>Status: <span className="text-green-500">OK</span></p>
        <p>URL: {typeof window !== 'undefined' ? window.location.origin : 'N/A'}</p>
      </div>
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Backend</h2>
        <p>Status: 
          {backendStatus === 'loading' && <span className="text-yellow-500">Loading...</span>}
          {backendStatus === 'ok' && <span className="text-green-500">OK</span>}
          {backendStatus === 'error' && <span className="text-red-500">Error</span>}
        </p>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}
        
        {backendData && (
          <div className="bg-gray-100 p-4 rounded">
            <pre className="whitespace-pre-wrap">{JSON.stringify(backendData, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
} 