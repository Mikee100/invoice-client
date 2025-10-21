import React from 'react';
import { useSelector } from 'react-redux';

const DebugAuth = () => {
  const authState = useSelector((state) => ({
    user: state.user.user,
    isAuthenticated: state.user.isAuthenticated,
    loading: state.user.loading,
    error: state.user.error,
    token: localStorage.getItem('invoice_management_token')
  }));

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Current State</h2>
        
        <div className="space-y-4">
          <div>
            <span className="font-medium">isAuthenticated:</span>{' '}
            <span className={`font-bold ${authState.isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
              {authState.isAuthenticated ? 'true' : 'false'}
            </span>
          </div>
          
          <div>
            <span className="font-medium">Loading:</span>{' '}
            <span className="font-bold">{authState.loading ? 'true' : 'false'}</span>
          </div>
          
          <div>
            <span className="font-medium">Token exists:</span>{' '}
            <span className="font-bold">{authState.token ? 'Yes' : 'No'}</span>
          </div>
          
          {authState.error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{authState.error}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-6">
            <h3 className="font-medium mb-2">User Data:</h3>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
              {JSON.stringify(authState.user || 'No user data', null, 2)}
            </pre>
          </div>
          
          <div className="mt-4">
            <h3 className="font-medium mb-2">Token (first 20 chars):</h3>
            <div className="bg-gray-100 p-4 rounded-md font-mono text-sm break-all">
              {authState.token ? `${authState.token.substring(0, 20)}...` : 'No token'}
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t">
            <h3 className="font-medium mb-2">Local Storage:</h3>
            <div className="bg-gray-100 p-4 rounded-md">
              {Object.keys(localStorage).map((key) => (
                <div key={key} className="mb-2 pb-2 border-b">
                  <div className="font-mono text-sm">{key}: {localStorage[key]?.substring(0, 50)}...</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugAuth;
