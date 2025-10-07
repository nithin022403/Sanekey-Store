import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Database, Server } from 'lucide-react';
import { apiClient } from '../lib/api';

export const TestConnection: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [dbStatus, setDbStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [healthData, setHealthData] = useState<any>(null);
  const [dbData, setDbData] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [lastTest, setLastTest] = useState<Date | null>(null);

  useEffect(() => {
    testConnections();
    // Auto-refresh every 30 seconds
    const interval = setInterval(testConnections, 30000);
    return () => clearInterval(interval);
  }, []);

  const testConnections = async () => {
    console.log('🔄 Testing backend and database connections...');
    setHealthStatus('loading');
    setDbStatus('loading');
    setLastTest(new Date());

    // Test Backend API Health
    try {
      console.log('🔍 Testing backend API connection...');
      const healthResult = await apiClient.testConnection();
      if (healthResult.success) {
        setHealthData(healthResult.data);
        setHealthStatus('success');
        console.log('✅ Backend API connection successful:', healthResult.data);
      } else {
        throw new Error(healthResult.error);
      }
    } catch (error: any) {
      console.error('❌ Backend API connection failed:', error);
      setHealthStatus('error');
      setHealthData({ 
        error: 'Cannot connect to backend server',
        details: error.message || 'Backend server not running on http://localhost:8080',
        solution: 'Run: cd backend && mvn spring-boot:run',
        url: 'http://localhost:8080/api'
      });
    }

    // Test Database Connection
    try {
      console.log('🔍 Testing database connection...');
      const dbResult = await apiClient.testDatabase();
      if (dbResult.success) {
        setDbData(dbResult.data);
        setDbStatus('success');
        console.log('✅ Database connection successful:', dbResult.data);
      } else {
        throw new Error(dbResult.error);
      }
    } catch (error: any) {
      console.error('❌ Database connection failed:', error);
      setDbStatus('error');
      setDbData({ 
        error: 'Database connection test failed',
        details: error.message || 'MySQL server not accessible on localhost:3307',
        solution: 'Check MySQL service and credentials (root/nithin123)',
        port: '3307',
        database: 'sanekey_store'
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
        return <RefreshCw className="h-5 w-5 text-yellow-500 animate-spin" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-yellow-200 bg-yellow-50';
    }
  };

  const overallStatus = healthStatus === 'success' && dbStatus === 'success' ? 'success' : 
                      healthStatus === 'error' || dbStatus === 'error' ? 'error' : 'loading';

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className={`fixed bottom-4 right-4 p-3 rounded-full shadow-lg transition-colors ${
          overallStatus === 'success' ? 'bg-green-600 hover:bg-green-700' :
          overallStatus === 'error' ? 'bg-red-600 hover:bg-red-700' :
          'bg-yellow-600 hover:bg-yellow-700'
        } text-white`}
        title="Show Connection Status"
      >
        {overallStatus === 'success' ? <CheckCircle className="h-5 w-5" /> :
         overallStatus === 'error' ? <XCircle className="h-5 w-5" /> :
         <RefreshCw className="h-5 w-5 animate-spin" />}
      </button>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 rounded-lg shadow-lg p-4 border max-w-sm transition-all ${getStatusColor(overallStatus)}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 flex items-center">
          <Database className="h-4 w-4 mr-2" />
          System Status
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 text-sm"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 mb-3">
        <div className="flex items-center space-x-2">
          <Server className="h-4 w-4 text-blue-600" />
          {getStatusIcon(healthStatus)}
          <span className="text-sm">
            Backend API: {healthStatus === 'success' ? 'Connected' : healthStatus === 'loading' ? 'Testing...' : 'Failed'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Database className="h-4 w-4 text-purple-600" />
          {getStatusIcon(dbStatus)}
          <span className="text-sm">
            MySQL (3307): {dbStatus === 'success' ? 'Connected' : dbStatus === 'loading' ? 'Testing...' : 'Failed'}
          </span>
        </div>
      </div>

      {/* Success Details */}
      {healthStatus === 'success' && dbStatus === 'success' && (
        <div className="mb-3 p-2 bg-green-100 rounded text-xs text-green-700">
          <p className="font-medium">✅ All systems operational</p>
          {healthData && (
            <p className="text-xs text-gray-600 mt-1">
              API: {healthData.message}
            </p>
          )}
          {dbData && (
            <p className="text-xs text-gray-600">
              DB: {dbData.database} v{dbData.version}
            </p>
          )}
          {lastTest && (
            <p className="text-xs text-gray-500 mt-1">
              Last tested: {lastTest.toLocaleTimeString()}
            </p>
          )}
        </div>
      )}

      {/* Error Details */}
      {(healthStatus === 'error' || dbStatus === 'error') && (
        <div className="mb-3 p-2 bg-red-100 rounded text-xs text-red-700">
          <p className="font-medium">❌ Connection Issues:</p>
          {healthStatus === 'error' && (
            <div className="mt-1">
              <p>• Backend API (Port 8080)</p>
              <p className="text-xs text-gray-600 ml-2">
                Solution: cd backend && mvn spring-boot:run
              </p>
            </div>
          )}
          {dbStatus === 'error' && (
            <div className="mt-1">
              <p>• MySQL Database (Port 3307)</p>
              <p className="text-xs text-gray-600 ml-2">
                Solution: Start MySQL on port 3307
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex space-x-2">
        <button
          onClick={testConnections}
          disabled={healthStatus === 'loading' || dbStatus === 'loading'}
          className="flex-1 px-3 py-2 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {healthStatus === 'loading' || dbStatus === 'loading' ? (
            <>
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </>
          )}
        </button>
      </div>

      {/* Connection URLs */}
      <div className="mt-2 text-xs text-gray-500">
        <p>Backend: localhost:8080/api</p>
        <p>MySQL: localhost:3307/sanekey_store</p>
      </div>
    </div>
  );
};