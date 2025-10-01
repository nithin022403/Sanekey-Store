import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const TestConnection: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [dbStatus, setDbStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [healthData, setHealthData] = useState<any>(null);
  const [dbData, setDbData] = useState<any>(null);

  useEffect(() => {
    testConnections();
  }, []);

  const testConnections = async () => {
    // Test API Health
    try {
      const healthResponse = await fetch('http://localhost:8080/api/test/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      });
      const healthResult = await healthResponse.json();
      setHealthData(healthResult);
      setHealthStatus(healthResponse.ok ? 'success' : 'error');
    } catch (error) {
      setHealthStatus('error');
      setHealthData({ 
        error: 'Cannot connect to backend server',
        details: 'Backend server not running on http://localhost:8080',
        solution: 'Run: cd backend && mvn spring-boot:run'
      });
    }

    // Test Database Connection
    try {
      const dbResponse = await fetch('http://localhost:8080/api/test/db', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 15000, // 15 second timeout for DB
      });
      const dbResult = await dbResponse.json();
      setDbData(dbResult);
      setDbStatus(dbResponse.ok ? 'success' : 'error');
    } catch (error) {
      setDbStatus('error');
      setDbData({ 
        error: 'Database connection test failed',
        details: 'MySQL server not accessible on localhost:3307',
        solution: 'Check MySQL service and credentials (root/nithin123)'
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500 animate-spin" />;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 border max-w-sm">
      <h3 className="font-semibold text-gray-900 mb-3">Connection Status</h3>
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          {getStatusIcon(healthStatus)}
          <span className="text-sm">
            Backend API: {healthStatus === 'success' ? 'Connected' : 'Failed'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {getStatusIcon(dbStatus)}
          <span className="text-sm">
            Database: {dbStatus === 'success' ? 'Connected' : 'Failed'}
          </span>
        </div>
      </div>

      {(healthStatus === 'error' || dbStatus === 'error') && (
        <div className="mt-3 p-2 bg-red-50 rounded text-xs text-red-700">
          <p>Issues detected:</p>
          {healthStatus === 'error' && (
            <div>
              <p>• Backend server not running</p>
              <p className="text-xs text-gray-600 ml-2">Run: cd backend && mvn spring-boot:run</p>
            </div>
          )}
          {dbStatus === 'error' && (
            <div>
              <p>• Database connection failed</p>
              <p className="text-xs text-gray-600 ml-2">Check MySQL on localhost:3307</p>
            </div>
          )}
        </div>
      )}

      <button
        onClick={testConnections}
        className="mt-3 w-full px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
      >
        Retry Connection
      </button>
    </div>
  );
};