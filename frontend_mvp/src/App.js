import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE = 'http://localhost:3001';

function App() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    setLoading(true);
    setError('');

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await axios.post(`${API_BASE}/upload`, formData);
        
        setUploadedFiles(prev => [...prev, {
          name: file.name,
          rows: response.data.rows,
          columns: response.data.columns
        }]);
      } catch (err) {
        setError(`Erro ao carregar ${file.name}: ${err.message}`);
      }
    }
    setLoading(false);
  };

  const generateDashboard = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get(`${API_BASE}/dashboard`);
      setDashboard(response.data);
    } catch (err) {
      setError(`Erro ao gerar dashboard: ${err.message}`);
    }
    
    setLoading(false);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🚀 DataHub MVP - Business Intelligence</h1>
        <p>Upload CSVs e visualize KPIs automaticamente</p>
      </header>

      <main className="main">
        <section className="upload-section">
          <h2>📁 Upload de Arquivos CSV</h2>
          <input
            type="file"
            multiple
            accept=".csv"
            onChange={handleFileUpload}
            className="file-input"
          />
          
          {uploadedFiles.length > 0 && (
            <div className="uploaded-files">
              <h3>Arquivos Carregados:</h3>
              {uploadedFiles.map((file, index) => (
                <div key={index} className="file-item">
                  ✅ {file.name} - {file.rows} linhas, {file.columns} colunas
                </div>
              ))}
              <button 
                onClick={generateDashboard}
                disabled={loading}
                className="generate-btn"
              >
                {loading ? 'Gerando...' : '📊 Gerar Dashboard'}
              </button>
            </div>
          )}
        </section>

        {error && (
          <div className="error">❌ {error}</div>
        )}

        {dashboard && (
          <section className="dashboard">
            <h2>📈 Dashboard - KPIs Principais</h2>
            
            <div className="kpis-grid">
              <div className="kpi-card">
                <h3>💰 Total de Vendas</h3>
                <p className="kpi-value">{dashboard.kpis.total_vendas}</p>
              </div>
              <div className="kpi-card">
                <h3>🛒 Transações</h3>
                <p className="kpi-value">{dashboard.kpis.total_transacoes}</p>
              </div>
              <div className="kpi-card">
                <h3>🎯 Ticket Médio</h3>
                <p className="kpi-value">{dashboard.kpis.ticket_medio}</p>
              </div>
              <div className="kpi-card">
                <h3>📊 Registros</h3>
                <p className="kpi-value">{dashboard.dados_raw.total_registros}</p>
              </div>
            </div>

            <div className="analytics-grid">
              <div className="analytics-card">
                <h3>🏆 Top Vendedores</h3>
                {dashboard.top_vendedores && Object.entries(dashboard.top_vendedores)
                  .sort(([,a], [,b]) => parseFloat(b.replace(/[R$\s,.]/g, '')) - parseFloat(a.replace(/[R$\s,.]/g, '')))
                  .map(([vendedor, valor]) => (
                  <div key={vendedor} className="metric-item">
                    <span>{vendedor}:</span> <strong>{valor}</strong>
                  </div>
                ))}
              </div>

              <div className="analytics-card">
                <h3>📊 Atacado vs Varejo</h3>
                {dashboard.canais && Object.entries(dashboard.canais)
                  .sort(([,a], [,b]) => parseFloat(b.total.replace(/[R$\s,.]/g, '')) - parseFloat(a.total.replace(/[R$\s,.]/g, '')))
                  .map(([canal, dados]) => (
                  <div key={canal} className="metric-item">
                    <span>{canal}: {dados.total}</span>
                    <small>Ticket: {dados.ticket_medio}</small>
                  </div>
                ))}
                <div className="metric-item total">
                  <span>TOTAL GERAL:</span>
                  <strong>{dashboard.kpis.total_vendas}</strong>
                </div>
              </div>

              <div className="analytics-card">
                <h3>⚠️ Alertas de Estoque</h3>
                {dashboard.estoque && Object.entries(dashboard.estoque)
                  .filter(([produto, info]) => info.status === 'CRÍTICO')
                  .map(([produto, info]) => (
                  <div key={produto} className="metric-item alert">
                    <span>{produto}:</span> 
                    <strong>{info.atual}/{info.minimo} unidades</strong>
                  </div>
                ))}
              </div>

              <div className="analytics-card">
                <h3>📈 Sazonalidade (Maiores Vendas)</h3>
                {dashboard.sazonalidade && Object.entries(dashboard.sazonalidade)
                  .slice(0, 5)
                  .map(([mes, valor]) => (
                  <div key={mes} className="metric-item">
                    <span>{mes}:</span> <strong>{valor}</strong>
                  </div>
                ))}
              </div>

              <div className="analytics-card">
                <h3>🌎 Vendas por Região</h3>
                {Object.entries(dashboard.vendas_por_regiao)
                  .sort(([,a], [,b]) => parseFloat(b.replace(/[R$\s,.]/g, '')) - parseFloat(a.replace(/[R$\s,.]/g, '')))
                  .map(([regiao, valor]) => (
                  <div key={regiao} className="metric-item">
                    <span>{regiao}:</span> <strong>{valor}</strong>
                  </div>
                ))}
              </div>

              <div className="analytics-card">
                <h3>🏆 Top Produtos</h3>
                {Object.entries(dashboard.top_produtos)
                  .sort(([,a], [,b]) => parseFloat(b.replace(/[R$\s,.]/g, '')) - parseFloat(a.replace(/[R$\s,.]/g, '')))
                  .map(([produto, valor]) => (
                  <div key={produto} className="metric-item">
                    <span>{produto}:</span> <strong>{valor}</strong>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;