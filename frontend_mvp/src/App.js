import React from 'react';
import Chart from 'react-apexcharts';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  MapPin, 
  Package,
  AlertCircle,
  CheckCircle,
  Upload
} from 'lucide-react';

// Components
import { Layout, Container, Section } from './components/layout/Layout';
import { Header } from './components/layout/Header';
import { Card, CardBody, CardTitle } from './components/ui/Card';
import { Button } from './components/ui/Button';
import { KPICard } from './components/ui/KPICard';
import { FileUpload } from './components/ui/FileUpload';
import { LoadingState, ProcessingAnimation } from './components/ui/LoadingSpinner';
import { ChartCard } from './components/charts/ChartCard';
import { MetricsList } from './components/charts/MetricsList';

// Hooks
import { useDataUpload } from './hooks/useDataUpload';

// Utils
const formatBRL = (value) => {
  if (typeof value === 'string') {
    value = parseFloat(value.replace(/[R$\\s,.]/g, ''));
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

function App() {
  const {
    uploadedFiles,
    dashboard,
    loading,
    processing,
    error,
    currentStep,
    processingSteps,
    uploadFiles,
    generateDashboard,
    resetData,
    canGenerateDashboard
  } = useDataUpload();

  // Render upload section
  const renderUploadSection = () => (
    <Section>
      <Container size="default">
        <Card className="max-w-4xl mx-auto">
          <CardBody className="p-8">
            <div className="text-center mb-8">
              <CardTitle className="text-2xl mb-2">
                Upload de Dados
              </CardTitle>
              <p className="text-gray-600">
                Envie seus arquivos CSV ou Excel para gerar o dashboard automático
              </p>
            </div>

            <FileUpload 
              onFilesSelect={uploadFiles}
              disabled={loading || processing}
            />

            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800">Erro</h4>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {uploadedFiles.length > 0 && (
              <div className="mt-8 space-y-4">
                <h4 className="text-lg font-semibold text-gray-900">
                  Arquivos Processados ({uploadedFiles.length})
                </h4>
                
                <div className="grid gap-3">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-600">
                            {file.rows} linhas • {file.columns} colunas
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center pt-4">
                  <Button
                    onClick={generateDashboard}
                    disabled={!canGenerateDashboard}
                    loading={processing}
                    size="lg"
                    icon={Upload}
                  >
                    {processing ? 'Processando...' : 'Gerar Dashboard'}
                  </Button>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </Container>
    </Section>
  );

  // Render processing state
  const renderProcessing = () => (
    <Section>
      <Container>
        <Card className="max-w-2xl mx-auto">
          <CardBody>
            <ProcessingAnimation 
              steps={processingSteps}
              currentStep={currentStep}
            />
          </CardBody>
        </Card>
      </Container>
    </Section>
  );

  // Render KPI grid
  const renderKPIs = () => {
    if (!dashboard?.kpis) return null;

    const kpis = [
      {
        title: 'Vendas Total',
        value: dashboard.kpis.total_vendas,
        icon: DollarSign
      },
      {
        title: 'Transações',
        value: dashboard.kpis.total_transacoes,
        icon: ShoppingCart
      },
      {
        title: 'Ticket Médio',
        value: dashboard.kpis.ticket_medio,
        icon: TrendingUp
      },
      {
        title: 'Cidade Top',
        value: dashboard.vendas_por_regiao ? 
          Object.entries(dashboard.vendas_por_regiao)
            .sort(([,a], [,b]) => parseFloat(b.replace(/[R$\s,.]/g, '')) - parseFloat(a.replace(/[R$\s,.]/g, '')))
            [0][0] : '-',
        icon: MapPin,
        subtitle: 'Maior faturamento'
      },
      {
        title: 'Cidades Atendidas',
        value: dashboard.vendas_por_regiao ? Object.keys(dashboard.vendas_por_regiao).length : 0,
        icon: MapPin
      },
      {
        title: 'Produtos Diferentes',
        value: dashboard.todos_produtos ? dashboard.todos_produtos.length : 0,
        icon: Package
      },
      {
        title: 'Melhor Vendedor',
        value: dashboard.top_vendedores ? 
          Object.entries(dashboard.top_vendedores)
            .sort(([,a], [,b]) => parseFloat(b.replace(/[R$\s]/g, '').replace(/,/g, '')) - parseFloat(a.replace(/[R$\s]/g, '').replace(/,/g, '')))
            [0][0] : '-',
        icon: Users,
        subtitle: 'Top performer'
      },
      {
        title: 'Valor em Estoque',
        value: dashboard.kpis.valor_estoque,
        icon: Package,
        subtitle: 'Total disponível'
      },
      {
        title: 'Itens em Estoque',
        value: dashboard.estoque ? Object.keys(dashboard.estoque).length : 0,
        icon: Package,
        subtitle: 'Produtos disponíveis'
      },
      {
        title: 'Arquivos Processados',
        value: dashboard.kpis.arquivos_carregados || 0,
        icon: Upload,
        subtitle: 'Fontes de dados'
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        {kpis.map((kpi, index) => (
          <KPICard
            key={index}
            title={kpi.title}
            value={kpi.value}
            subtitle={kpi.subtitle}
            icon={kpi.icon}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          />
        ))}
      </div>
    );
  };

  // Render charts
  const renderCharts = () => {
    if (!dashboard) return null;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {/* Vendas por Região */}
        {dashboard.vendas_por_regiao && (
          <ChartCard title="Vendas por Cidade" subtitle="Distribuição geográfica das vendas" actions={false}>
            <Chart
              options={{
                chart: { type: 'donut', toolbar: { show: false } },
                labels: Object.keys(dashboard.vendas_por_regiao),
                colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'],
                legend: { position: 'bottom' },
                dataLabels: { enabled: true, formatter: (val) => val.toFixed(1) + '%' },
                plotOptions: { pie: { donut: { size: '60%' } } },
                responsive: [{ breakpoint: 480, options: { chart: { width: 300 } } }]
              }}
              series={Object.values(dashboard.vendas_por_regiao).map(val => 
                parseFloat(val.replace(/[R$\\s]/g, '').replace(/,/g, ''))
              )}
              type="donut"
              height={350}
            />
          </ChartCard>
        )}

        {/* Canais de Venda */}
        {dashboard.canais && (
          <ChartCard title="Performance por Canal" subtitle="Atacado vs Varejo" actions={false}>
            <Chart
              options={{
                chart: { type: 'bar', toolbar: { show: false } },
                colors: ['#3b82f6'],
                plotOptions: { bar: { borderRadius: 8, columnWidth: '60%' } },
                dataLabels: { enabled: false },
                xaxis: { categories: Object.keys(dashboard.canais) },
                yaxis: { labels: { formatter: (val) => formatBRL(val) } }
              }}
              series={[{
                name: 'Receita Total',
                data: Object.values(dashboard.canais).map(canal => 
                  parseFloat(canal.total.replace(/[R$\\s]/g, '').replace(/,/g, ''))
                )
              }]}
              type="bar"
              height={350}
            />
          </ChartCard>
        )}

        {/* Sazonalidade */}
        {dashboard.sazonalidade && (
          <ChartCard title="Tendência de Vendas" subtitle="Evolução mensal das vendas" actions={false}>
            <Chart
              options={{
                chart: { type: 'area', toolbar: { show: false } },
                colors: ['#10b981'],
                fill: { 
                  type: 'gradient',
                  gradient: { opacityFrom: 0.6, opacityTo: 0.1 }
                },
                stroke: { curve: 'smooth', width: 3 },
                xaxis: { categories: Object.keys(dashboard.sazonalidade) },
                yaxis: { labels: { formatter: (val) => formatBRL(val) } }
              }}
              series={[{
                name: 'Vendas',
                data: Object.values(dashboard.sazonalidade).map(val => 
                  parseFloat(val.replace(/[R$\\s]/g, '').replace(/,/g, ''))
                )
              }]}
              type="area"
              height={350}
            />
          </ChartCard>
        )}

        {/* Top Produtos */}
        {dashboard.top_produtos_quantidade && (
          <ChartCard title="Produtos Mais Vendidos" subtitle="Ranking por quantidade" actions={false}>
            <Chart
              options={{
                chart: { type: 'bar', toolbar: { show: false } },
                colors: ['#8b5cf6'],
                plotOptions: { bar: { borderRadius: 6, horizontal: true } },
                dataLabels: { enabled: false },
                xaxis: { categories: dashboard.top_produtos_quantidade.map(([produto]) => produto) }
              }}
              series={[{
                name: 'Unidades Vendidas',
                data: dashboard.top_produtos_quantidade.map(([, qtd]) => qtd)
              }]}
              type="bar"
              height={350}
            />
          </ChartCard>
        )}

        {/* Ranking Completo de Produtos por Vendas */}
        {dashboard.todos_produtos && (
          <ChartCard title="Ranking de Produtos por Vendas" subtitle="Todos os produtos ordenados por faturamento" actions={false}>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {dashboard.todos_produtos
                .sort(([,a], [,b]) => parseFloat(b.vendas.replace(/[R$\s]/g, '').replace(/,/g, '')) - parseFloat(a.vendas.replace(/[R$\s]/g, '').replace(/,/g, '')))
                .map(([produto, info], index) => (
                <div key={produto} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white
                      ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-primary-600'}
                    `}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{produto}</p>
                      <p className="text-xs text-gray-500">{info.quantidade} unidades vendidas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{info.vendas}</p>
                    <p className="text-xs text-gray-500">{info.preco_unitario}</p>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        )}

        {/* Estoque Atual por Produto */}
        {dashboard.estoque && (
          <ChartCard title="Controle de Estoque" subtitle="Produtos disponíveis e status de estoque" actions={false}>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {Object.entries(dashboard.estoque)
                .sort(([,a], [,b]) => b.atual - a.atual)
                .map(([produto, info], index) => (
                <div key={produto} className={`
                  flex items-center justify-between p-3 rounded-lg border transition-colors
                  ${info.status === 'CRÍTICO' ? 'border-red-200 bg-red-50 hover:bg-red-100' : 'border-gray-100 hover:bg-gray-50'}
                `}>
                  <div className="flex items-center space-x-3">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white
                      ${info.status === 'CRÍTICO' ? 'bg-red-500' : 'bg-green-500'}
                    `}>
                      {info.status === 'CRÍTICO' ? '⚠' : '✓'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{produto}</p>
                      <p className={`text-xs ${info.status === 'CRÍTICO' ? 'text-red-600' : 'text-gray-500'}`}>
                        Estoque mínimo: {info.minimo} unidades
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold text-lg ${info.status === 'CRÍTICO' ? 'text-red-600' : 'text-gray-900'}`}>
                      {info.atual}
                    </p>
                    <p className="text-xs text-gray-500">
                      {info.preco_varejo}
                    </p>
                    <span className={`
                      inline-block px-2 py-1 rounded-full text-xs font-medium mt-1
                      ${info.status === 'CRÍTICO' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}
                    `}>
                      {info.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        )}
      </div>
    );
  };

  // Render metrics lists
  const renderMetrics = () => {
    if (!dashboard) return null;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Top Vendedores */}
        {dashboard.top_vendedores && (
          <Card>
            <CardBody>
              <CardTitle className="mb-6">Top Vendedores</CardTitle>
              <MetricsList
                items={Object.entries(dashboard.top_vendedores)
                  .sort(([,a], [,b]) => parseFloat(b.replace(/[R$\\s]/g, '').replace(/,/g, '')) - parseFloat(a.replace(/[R$\\s]/g, '').replace(/,/g, '')))
                  .map(([name, value], index) => ({
                    name: `${index + 1}º ${name}`,
                    value: value,
                    status: index === 0 ? 'success' : 'default',
                    subtitle: 'Total de vendas'
                  }))
                }
              />
            </CardBody>
          </Card>
        )}

        {/* Metas vs Vendas */}
        {dashboard.metas_vs_vendas && (
          <Card>
            <CardBody>
              <CardTitle className="mb-6">Metas vs Resultados</CardTitle>
              <MetricsList
                items={Object.entries(dashboard.metas_vs_vendas).map(([cidade, info]) => ({
                  name: cidade,
                  value: info.vendas,
                  secondaryValue: `Meta: ${info.meta}`,
                  subtitle: info.percentual,
                  status: info.status === 'ATINGIDA' ? 'success' : 'warning'
                }))}
              />
            </CardBody>
          </Card>
        )}
      </div>
    );
  };

  return (
    <Layout>
      <Header />
      
      {processing && renderProcessing()}
      
      {!processing && !dashboard && renderUploadSection()}
      
      {!processing && dashboard && (
        <Section>
          <Container>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Dashboard Executivo
                </h2>
                <p className="text-gray-600 mt-1">
                  Análise completa dos seus dados de negócio
                </p>
              </div>
              <Button variant="outline" onClick={resetData}>
                Novo Upload
              </Button>
            </div>

            {renderKPIs()}
            {renderCharts()}
            {renderMetrics()}
          </Container>
        </Section>
      )}
    </Layout>
  );
}

export default App;