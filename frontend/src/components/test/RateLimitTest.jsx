import React, { useState } from 'react';
import { testRateLimit } from '../../api/client';

export default function RateLimitTest() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState(null);
  const [logs, setLogs] = useState([]);

  const handleTest = async () => {
    setTesting(true);
    setLogs([]);
    setResults(null);

    // Console logs'u capture et
    const originalLog = console.log;
    const originalError = console.error;
    const capturedLogs = [];

    console.log = (...args) => {
      const message = args
        .map((arg) =>
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        )
        .join(' ');
      capturedLogs.push({ type: 'log', message });
      originalLog(...args);
    };

    console.error = (...args) => {
      const message = args
        .map((arg) =>
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        )
        .join(' ');
      capturedLogs.push({ type: 'error', message });
      originalError(...args);
    };

    try {
      const result = await testRateLimit();
      setResults(result);
    } catch (err) {
      capturedLogs.push({ type: 'error', message: `Test failed: ${err.message}` });
      setResults({ success: false, message: err.message });
    } finally {
      console.log = originalLog;
      console.error = originalError;
      setLogs(capturedLogs);
      setTesting(false);
    }
  };
// UI kısmı tamamen pasif hale getirildi
  return null;

  /* 
  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-96 bg-slate-900 border border-emerald-500/30 rounded-lg p-4 font-mono text-xs overflow-y-auto shadow-lg">
      <div className="mb-3">
        <h3 className="text-emerald-400 font-bold mb-2">🧪 Rate Limit Test Panel</h3>
        <button
          onClick={handleTest}
          disabled={testing}
          className="w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded text-xs font-semibold"
        >
          {testing ? '⏳ Testing...' : '▶️ Start Test'}
        </button>
      </div>

      {results && (
        <div className="mb-3 p-2 bg-slate-800 rounded border border-emerald-500/20">
          <div className={results.success ? 'text-green-400' : 'text-red-400'}>
            {results.message}
          </div>
        </div>
      )}

      {logs.length > 0 && (
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {logs.map((log, idx) => (
            <div
              key={idx}
              className={`p-1 rounded text-[10px] \${
                log.type === 'error'
                  ? 'bg-red-500/10 text-red-300'
                  : 'bg-emerald-500/10 text-emerald-300'
              }`}
            >
              {log.message}
            </div>
          ))}
        </div>
      )}

      {logs.length === 0 && results && (
        <div className="text-slate-400 text-[10px]">Test sonuçları konsol'da görüntüleniyor...</div>
      )}
    </div>
  );
  */
}
