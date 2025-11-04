import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import DataUpload from './components/DataUpload';
import Dashboard from './components/Dashboard';
import './App.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [uploadedData, setUploadedData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    // Initialize WebSocket connection
    const newSocket = io(API_BASE);
    
    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to DataHub real-time service');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from DataHub service');
    });

    newSocket.on('data_uploaded', (data) => {
      console.log('Real-time update received:', data);
      setUploadedData(data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const handleDataUploaded = async (uploadResult) => {
    setUploadedData(uploadResult.data);
    
    // Fetch the actual data for dashboard
    try {
      const response = await fetch(`${API_BASE}/api/data/${uploadResult.cache_key}`);
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  const handleGenerateDashboard = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/generate-interactive-dashboard`);
      if (response.ok) {
        const dashboardResult = await response.json();
        setDashboardData(dashboardResult);
      } else {
        console.error('Failed to generate dashboard');
      }
    } catch (error) {
      console.error('Error generating dashboard:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                DataHub Universal Centralizer
              </h1>
              <p className="text-gray-600 text-sm">
                Transform any data source into interactive dashboards
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {!uploadedData ? (
          <div className="text-center">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Upload Your Data
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Support for Excel, CSV, Google Sheets, and more. 
                Get instant insights with real-time dashboards.
              </p>
            </div>
            <DataUpload onDataUploaded={handleDataUploaded} />
            
            {/* Features Section */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Universal Import</h3>
                <p className="text-gray-600">
                  Excel, CSV, Google Sheets, APIs, and database connections supported
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Updates</h3>
                <p className="text-gray-600">
                  WebSocket-powered live dashboards with sub-second response times
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Analytics</h3>
                <p className="text-gray-600">
                  AI-powered insights with automatic chart suggestions and data cleaning
                </p>
              </div>
            </div>
          </div>
        ) : (
          <Dashboard 
            uploadedData={uploadedData} 
            dashboardData={dashboardData}
            onReset={() => {
              setUploadedData(null);
              setDashboardData(null);
            }}
            onGenerateDashboard={handleGenerateDashboard}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-600">
          <p>
            DataHub Universal Centralizer - Enterprise Business Intelligence Solution
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;