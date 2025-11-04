import React, { useState, useEffect } from 'react';
import KPICard from './ui/KPICard';
import EnterpriseChart from './ui/EnterpriseChart';
import { ToastProvider, showSuccessToast, showErrorToast, showWarningToast, showInfoToast } from './ui/ToastNotification';
import '../styles/design-system.css';

const DemoPage = () => {
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('executive'); // 'executive' ou 'detailed'
  
  // Dados estáticos para demonstração
  const kpiData = {
    receita: 285000,
    usuarios: 12847,
    conversao: 3.2,
    satisfacao: 4.8,
    cac: 1250,
    ltv: 8750
  };

  // Sample chart data
  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Revenue (K)',
        data: [65, 59, 80, 81, 56, 55, 40, 89, 95, 102, 98, 120],
      },
      {
        label: 'Profit (K)',
        data: [28, 48, 40, 19, 86, 27, 90, 45, 60, 75, 82, 95],
      }
    ]
  };

  const barChartData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      {
        label: 'Sales 2023',
        data: [120, 135, 145, 160],
      },
      {
        label: 'Sales 2024',
        data: [140, 155, 165, 180],
      }
    ]
  };

  const doughnutData = {
    labels: ['Desktop', 'Mobile', 'Tablet'],
    datasets: [
      {
        label: 'Traffic Sources',
        data: [65, 25, 10],
      }
    ]
  };

  const handleKPIClick = (metric) => {
    showInfoToast(`Clicked on ${metric} metric`, {
      title: 'KPI Interaction',
      action: {
        label: 'View Details',
        onClick: () => showSuccessToast('Details opened!')
      }
    });
  };

  const handleChartClick = (element, data) => {
    showSuccessToast('Chart data point clicked!', {
      title: 'Chart Interaction'
    });
  };

  const toggleViewMode = () => {
    const newMode = viewMode === 'executive' ? 'detailed' : 'executive';
    setViewMode(newMode);
    showInfoToast(`Alterado para visão ${newMode === 'executive' ? 'Executiva' : 'Detalhada'}`, {
      title: 'Modo de Visualização',
      duration: 2000
    });
  };

  const processNewFile = () => {
    showInfoToast('Funcionalidade de upload em desenvolvimento', {
      title: 'Upload de Arquivos',
      duration: 3000
    });
  };

  const generateInsights = () => {
    showSuccessToast('Insights gerados com base nos dados carregados', {
      title: 'Análise Concluída',
      duration: 3000
    });
  };

  const showToastDemo = (type) => {
    const messages = {
      success: 'Dados sincronizados com sucesso de todas as fontes!',
      error: 'Falha ao conectar com a API do Google Sheets',
      warning: 'Qualidade dos dados abaixo de 85%',
      info: 'Novo template de dashboard disponível'
    };

    const toastFunctions = {
      success: showSuccessToast,
      error: showErrorToast,
      warning: showWarningToast,
      info: showInfoToast
    };

    toastFunctions[type](messages[type], {
      title: 'Notificação do Sistema',
      duration: 5000
    });
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="dh-heading-1 mb-4">DataHub - Central de Dashboards</h1>
          <p className="dh-body-large text-gray-600 mb-6">
            Faça upload de Excel, CSV, Google Sheets → Gere dashboards automáticos com insights
          </p>
          
          {/* Control Panel */}
          <div className="flex flex-wrap gap-4 mb-8">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1">
              <button 
                onClick={toggleViewMode}
                className={`px-4 py-2 rounded-md transition-all duration-200 font-medium text-sm ${
                  viewMode === 'executive' 
                    ? 'bg-blue-500 text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Executivo
              </button>
              <button 
                onClick={toggleViewMode}
                className={`px-4 py-2 rounded-md transition-all duration-200 font-medium text-sm ${
                  viewMode === 'detailed' 
                    ? 'bg-blue-500 text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Detalhado
              </button>
            </div>

            <button onClick={processNewFile} className="dh-btn dh-btn-primary">
              Processar Arquivos
            </button>

            <button onClick={generateInsights} className="dh-btn dh-btn-secondary">
              Gerar Insights
            </button>
            
            <button onClick={() => showToastDemo('success')} className="dh-btn dh-btn-secondary">
              Toast Sucesso
            </button>
            
            <button onClick={() => showToastDemo('error')} className="dh-btn dh-btn-secondary">
              Toast Erro
            </button>
            
            <button onClick={() => showToastDemo('warning')} className="dh-btn dh-btn-secondary">
              Toast Aviso
            </button>
            
            <button onClick={() => showToastDemo('info')} className="dh-btn dh-btn-secondary">
              Toast Info
            </button>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className={`grid gap-6 mb-8 ${
          viewMode === 'executive' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' 
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-6'
        }`}>
          <KPICard
            title="Total Revenue"
            value={revenue}
            previousValue={230000}
            unit="$"
            trend="up"
            realTime={isRealTimeActive}
            icon="💰"
            onClick={() => handleKPIClick('Revenue')}
          />
          
          <KPICard
            title="Active Users"
            value={users}
            previousValue={12200}
            trend="up"
            realTime={isRealTimeActive}
            icon="👥"
            onClick={() => handleKPIClick('Users')}
          />
          
          <KPICard
            title="Conversion Rate"
            value={conversion}
            previousValue={3.1}
            unit="%"
            trend="up"
            realTime={isRealTimeActive}
            icon="📈"
            onClick={() => handleKPIClick('Conversion')}
          />
          
          <KPICard
            title="Satisfaction"
            value={satisfaction}
            previousValue={4.6}
            unit="/5"
            trend="up"
            realTime={isRealTimeActive}
            icon="⭐"
            onClick={() => handleKPIClick('Satisfaction')}
          />

          {/* Detailed Mode: Additional KPIs */}
          {viewMode === 'detailed' && (
            <>
              <KPICard
                title="CAC"
                value={1250}
                previousValue={1380}
                unit="$"
                trend="down"
                realTime={isRealTimeActive}
                icon="🎯"
                onClick={() => handleKPIClick('CAC')}
              />
              
              <KPICard
                title="LTV"
                value={8750}
                previousValue={8200}
                unit="$"
                trend="up"
                realTime={isRealTimeActive}
                icon="💎"
                onClick={() => handleKPIClick('LTV')}
              />
            </>
          )}
        </div>

        {/* Charts Grid */}
        <div className={`grid gap-8 mb-8 ${
          viewMode === 'executive' 
            ? 'grid-cols-1 lg:grid-cols-2' 
            : 'grid-cols-1 lg:grid-cols-3'
        }`}>
          <EnterpriseChart
            type="line"
            data={lineChartData}
            title="Revenue & Profit Trends"
            subtitle="Monthly performance over the last 12 months"
            realTime={isRealTimeActive}
            dataQuality="excellent"
            onDataPointClick={handleChartClick}
            height={300}
          />
          
          <EnterpriseChart
            type="bar"
            data={barChartData}
            title="Quarterly Sales Comparison"
            subtitle="Year-over-year performance analysis"
            realTime={isRealTimeActive}
            dataQuality="good"
            onDataPointClick={handleChartClick}
            height={300}
          />

          {/* Detailed Mode: Additional Chart */}
          {viewMode === 'detailed' && (
            <EnterpriseChart
              type="doughnut"
              data={doughnutData}
              title="Customer Segments"
              subtitle="Distribution by customer type"
              dataQuality="excellent"
              height={300}
            />
          )}
        </div>

        {/* Full Width Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <EnterpriseChart
              type="line"
              data={{
                labels: Array.from({length: 24}, (_, i) => `${i}:00`),
                datasets: [{
                  label: 'Real-time Metrics',
                  data: Array.from({length: 24}, () => Math.floor(Math.random() * 100) + 50),
                }]
              }}
              title="Real-time Performance Dashboard"
              subtitle="Live metrics updated every 3 seconds"
              realTime={isRealTimeActive}
              dataQuality="excellent"
              height={350}
            />
          </div>
          
          <EnterpriseChart
            type="doughnut"
            data={doughnutData}
            title="Traffic Sources"
            subtitle="Device distribution breakdown"
            dataQuality="good"
            height={350}
          />
        </div>

        {/* Detailed Mode: Advanced Analytics */}
        {viewMode === 'detailed' && (
          <div className="mb-8">
            <h2 className="dh-heading-2 mb-6">📊 Advanced Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="dh-card p-6">
                <h4 className="dh-caption font-medium text-gray-500 uppercase tracking-wide mb-2">PERFORMANCE</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="dh-body text-gray-600">ROAS</span>
                    <span className="font-semibold text-green-600">4.2x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="dh-body text-gray-600">LTV/CAC</span>
                    <span className="font-semibold text-green-600">7.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="dh-body text-gray-600">Payback</span>
                    <span className="font-semibold">3.2 months</span>
                  </div>
                </div>
              </div>

              <div className="dh-card p-6">
                <h4 className="dh-caption font-medium text-gray-500 uppercase tracking-wide mb-2">EFFICIENCY</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="dh-body text-gray-600">Cost/Lead</span>
                    <span className="font-semibold text-blue-600">$85</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="dh-body text-gray-600">Win Rate</span>
                    <span className="font-semibold text-green-600">28.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="dh-body text-gray-600">Cycle Time</span>
                    <span className="font-semibold">32 days</span>
                  </div>
                </div>
              </div>

              <div className="dh-card p-6">
                <h4 className="dh-caption font-medium text-gray-500 uppercase tracking-wide mb-2">HEALTH</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="dh-body text-gray-600">Churn Rate</span>
                    <span className="font-semibold text-green-600">2.8%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="dh-body text-gray-600">NPS</span>
                    <span className="font-semibold text-green-600">72</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="dh-body text-gray-600">Uptime</span>
                    <span className="font-semibold text-green-600">99.97%</span>
                  </div>
                </div>
              </div>

              <div className="dh-card p-6">
                <h4 className="dh-caption font-medium text-gray-500 uppercase tracking-wide mb-2">GROWTH</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="dh-body text-gray-600">MRR Growth</span>
                    <span className="font-semibold text-green-600">+18.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="dh-body text-gray-600">User Growth</span>
                    <span className="font-semibold text-green-600">+8.0%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="dh-body text-gray-600">Market Share</span>
                    <span className="font-semibold">15.3%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feature Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="dh-card p-6">
            <h3 className="dh-heading-3 mb-4">🎨 Design System</h3>
            <ul className="space-y-2 dh-body text-gray-600">
              <li>✅ Custom CSS variables</li>
              <li>✅ Light/Dark theme support</li>
              <li>✅ Enterprise color palette</li>
              <li>✅ Consistent spacing & typography</li>
            </ul>
          </div>
          
          <div className="dh-card p-6">
            <h3 className="dh-heading-3 mb-4">⚡ Microinteractions</h3>
            <ul className="space-y-2 dh-body text-gray-600">
              <li>✅ Smooth number animations</li>
              <li>✅ Shimmer hover effects</li>
              <li>✅ Real-time pulse indicators</li>
              <li>✅ Glassmorphism elements</li>
            </ul>
          </div>
          
          <div className="dh-card p-6">
            <h3 className="dh-heading-3 mb-4">🚀 Enterprise Features</h3>
            <ul className="space-y-2 dh-body text-gray-600">
              <li>✅ Real-time WebSocket updates</li>
              <li>✅ Data quality indicators</li>
              <li>✅ Interactive chart drilling</li>
              <li>✅ Toast notification system</li>
              {viewMode === 'detailed' && (
                <>
                  <li>✅ Advanced analytics engine</li>
                  <li>✅ Multi-view dashboard modes</li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="dh-caption text-gray-500">
            DataHub Universal Centralizer - Enterprise Business Intelligence Platform
          </p>
        </div>
      </div>
    </ToastProvider>
  );
};

export default DemoPage;