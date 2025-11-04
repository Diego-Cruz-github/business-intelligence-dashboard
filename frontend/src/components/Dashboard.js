import React from 'react';
import KPICard from './ui/KPICard';
import EnterpriseChart from './ui/EnterpriseChart';

const Dashboard = ({ uploadedData, dashboardData, onReset, onGenerateDashboard }) => {
  if (!uploadedData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhum dado carregado</p>
      </div>
    );
  }

  // Verificar se são múltiplos arquivos
  const isMultipleFiles = uploadedData.data?.datasets && uploadedData.data.datasets.length > 1;

  return (
    <div className="space-y-6">
      {/* Header com informações do arquivo */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Dashboard - {uploadedData.data?.filename || uploadedData.filename}
            </h2>
            {isMultipleFiles ? (
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Arquivos</p>
                  <p className="text-lg font-semibold">{uploadedData.data.total_files}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Linhas</p>
                  <p className="text-lg font-semibold">{uploadedData.data.rows}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Datasets</p>
                  <p className="text-lg font-semibold">
                    {uploadedData.data.datasets.map(d => d.filename).join(', ')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Upload</p>
                  <p className="text-lg font-semibold">
                    {new Date(uploadedData.data.upload_time).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Linhas</p>
                  <p className="text-lg font-semibold">{uploadedData.data?.rows || uploadedData.rows}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Colunas</p>
                  <p className="text-lg font-semibold">{uploadedData.data?.columns || uploadedData.columns}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Upload</p>
                  <p className="text-lg font-semibold">
                    {new Date(uploadedData.data?.upload_time || uploadedData.upload_time).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onGenerateDashboard}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              📊 GERAR DASHBOARD
            </button>
            <button
              onClick={onReset}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Novo Upload
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      {isMultipleFiles ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <KPICard
            title="Arquivos Processados"
            value={uploadedData.data.total_files}
            format="number"
            trend={0}
            icon="📁"
          />
          <KPICard
            title="Total de Registros"
            value={uploadedData.data.rows}
            format="number"
            trend={5.2}
            icon="📊"
          />
          <KPICard
            title="Datasets Conectados"
            value="TechFlow"
            format="text"
            trend={0}
            icon="🔗"
          />
          <KPICard
            title="Status Integração"
            value="Sucesso"
            format="text"
            trend={100}
            icon="✅"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <KPICard
            title="Total de Registros"
            value={uploadedData.data?.rows || uploadedData.rows}
            format="number"
            trend={5.2}
            icon="📊"
          />
          <KPICard
            title="Colunas"
            value={uploadedData.data?.columns || uploadedData.columns}
            format="number"
            trend={0}
            icon="📋"
          />
          <KPICard
            title="Status"
            value="Processado"
            format="text"
            trend={0}
            icon="✅"
          />
          <KPICard
            title="Qualidade"
            value={uploadedData.analytics?.data_quality || uploadedData.data?.quality || 100}
            format="percentage"
            trend={2.1}
            icon="⭐"
          />
        </div>
      )}

      {/* Dashboard Interativo */}
      {dashboardData && dashboardData.charts && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4">🎯 Dashboard Inteligente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Relacionamentos Detectados</p>
                <p className="text-2xl font-bold text-blue-800">{dashboardData.relationships_detected || 0}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Gráficos Gerados</p>
                <p className="text-2xl font-bold text-green-800">{dashboardData.charts?.length || 0}</p>
              </div>
            </div>
            {dashboardData.executive_summary && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">📋 Resumo Executivo</h4>
                <p className="text-sm text-gray-700">{dashboardData.executive_summary.key_insight}</p>
              </div>
            )}
          </div>

          {/* Gráficos Interativos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {dashboardData.charts?.map((chart, index) => (
              <div key={chart.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold">{chart.title}</h4>
                    <p className="text-sm text-gray-600">{chart.description}</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {chart.type}
                  </span>
                </div>
                
                {/* Display chart data */}
                <div className="h-64 bg-gray-50 rounded-lg p-4">
                  <div className="text-center mb-4">
                    <div className="text-3xl mb-2">📊</div>
                    <p className="text-sm text-blue-600 font-medium">{chart.description}</p>
                  </div>
                  
                  {/* Display actual data */}
                  {chart.data && (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {Object.entries(chart.data).map(([key, value], index) => (
                        <div key={index} className="flex justify-between items-center bg-white p-2 rounded border">
                          <span className="text-sm font-medium text-gray-700">{key}</span>
                          <span className="text-sm text-blue-600 font-bold">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {chart.interactive_features && (
                    <div className="mt-3 text-center">
                      <p className="text-xs text-gray-500">
                        {chart.interactive_features.join(' • ')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Insights de Negócio */}
          {dashboardData.business_insights && dashboardData.business_insights.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="text-lg font-semibold mb-4">💡 Insights de Negócio</h4>
              <div className="space-y-3">
                {dashboardData.business_insights.map((insight, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <h5 className="font-medium">{insight.title}</h5>
                    <p className="text-sm text-gray-600">{insight.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dados processados (versão simplificada) */}
      {dashboardData && !dashboardData.charts && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Dados Processados</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {dashboardData.columns?.map((column, index) => (
                    <th
                      key={index}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.data?.slice(0, 10).map((row, index) => (
                  <tr key={index}>
                    {dashboardData.columns?.map((column, colIndex) => (
                      <td
                        key={colIndex}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {row[column]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {dashboardData.total_rows > 10 && (
            <p className="text-sm text-gray-500 mt-4">
              Mostrando 10 de {dashboardData.total_rows} registros
            </p>
          )}
        </div>
      )}

      {/* Colunas disponíveis */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Estrutura dos Dados</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {uploadedData.column_names?.map((column, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium">{column}</span>
              <span className="text-sm text-gray-500">
                {uploadedData.data_types?.[column] || 'unknown'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;