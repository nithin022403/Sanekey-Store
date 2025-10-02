import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { apiClient } from '../lib/api';

export const TestConnection: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [dbStatus, setDbStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [healthData, setHealthData] = useState<any>(null);
  const [dbData, setDbData] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    testConnections();
  }, []);

  const testConnections = async () => {
    console.log('🔄 Testing backend connections...');
    setHealthStatus('loading');
    setDbStatus('loading');

    // Test API Health
    try {
      const healthResult = await apiClient.testConnection();
      if (healthResult.success) {
        setHealthData(healthResult.data);
        setHealthStatus('success');
        console.log('✅ Backend API connection successful');
      } else {
        throw new Error(healthResult.error);
      }
    } catch (error: any) {
      console.error('❌ Backend API connection failed:', error);
      setHealthStatus('error');
      setHealthData({ 
        error: 'Cannot connect to backend server',
        details: error.message || 'Backend server not running on http://localhost:8080',
        solution: 'Run: cd backend && mvn spring-boot:run'
      });
    }

    // Test Database Connection
    try {
      const dbResult = await apiClient.testDatabase();
      if (dbResult.success) {
        setDbData(dbResult.data);
        setDbStatus('success');
        console.log('✅ Database connection successful');
      } else {
        throw new Error(dbResult.error);
      }
    } catch (error: any) {
      console.error('❌ Database connection failed:', error);
      setDbStatus('error');
      setDbData({ 
        error: 'Database connection test failed',
        details: error.message || 'MySQL server not accessible on localhost:3307',
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

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
        title="Show Connection Status"
      >
        <AlertCircle className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 rounded-lg shadow-lg p-4 border max-w-sm transition-all ${getStatusColor(healthStatus === 'success' && dbStatus === 'success' ? 'success' : 'error')}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">Connection Status</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 text-sm"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 mb-3">
        <div className="flex items-center space-x-2">
          {getStatusIcon(healthStatus)}
          <span className="text-sm">
            Backend API: {healthStatus === 'success' ? 'Connected' : healthStatus === 'loading' ? 'Testing...' : 'Failed'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {getStatusIcon(dbStatus)}
          <span className="text-sm">
            Database: {dbStatus === 'success' ? 'Connected' : dbStatus === 'loading' ? 'Testing...' : 'Failed'}
          </span>
        </div>
      </div>

      {/* Success Details */}
      {healthStatus === 'success' && dbStatus === 'success' && (
        <div className="mb-3 p-2 bg-green-100 rounded text-xs text-green-700">
          <p>✅ All systems operational</p>
          {healthData && (
            <p className="text-xs text-gray-600 mt-1">
              API: {healthData.message}
            </p>
          )}
          {dbData && (
            <p className="text-xs text-gray-600">
              DB: {dbData.database} on {dbData.host}:{dbData.port}
            </p>
          )}
        </div>
      )}

      {/* Error Details */}
      {(healthStatus === 'error' || dbStatus === 'error') && (
        <div className="mb-3 p-2 bg-red-100 rounded text-xs text-red-700">
          <p className="font-medium">Issues detected:</p>
          {healthStatus === 'error' && (
            <div className="mt-1">
              <p>• Backend server not running</p>
              <p className="text-xs text-gray-600 ml-2">
                Solution: cd backend && mvn spring-boot:run
              </p>
            </div>
          )}
          {dbStatus === 'error' && (
            <div className="mt-1">
              <p>• Database connection failed</p>
              <p className="text-xs text-gray-600 ml-2">
                Solution: Check MySQL on localhost:3307
              </p>
            </div>
          )}
        </div>
      )}

      <button
        onClick={testConnections}
        disabled={healthStatus === 'loading' || dbStatus === 'loading'}
        className="w-full px-3 py-2 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
      >
        {healthStatus === 'loading' || dbStatus === 'loading' ? (
          <>
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            Testing...
          </>
        ) : (
          'Retry Connection'
        )}
      </button>
    </div>
  );
};