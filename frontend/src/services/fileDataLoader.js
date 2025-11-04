/**
 * Carregador de dados dos arquivos reais de teste
 * Lê e processa os CSVs, JSONs e XMLs criados
 */

export class FileDataLoader {
  constructor() {
    this.dataPath = '/test-data/';
  }

  // Carrega dados de vendas do CSV real
  async loadVendasCSV() {
    try {
      const response = await fetch(`${this.dataPath}vendas-2024.csv`);
      const csvText = await response.text();
      return this.parseCSV(csvText);
    } catch (error) {
      console.error('Erro ao carregar vendas CSV:', error);
      return this.getFallbackVendasData();
    }
  }

  // Carrega métricas profissionais do CSV
  async loadMetricasProfissionais() {
    try {
      const response = await fetch(`${this.dataPath}metricas-profissionais-avancadas.csv`);
      const csvText = await response.text();
      return this.parseCSV(csvText);
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
      return this.getFallbackMetricasData();
    }
  }

  // Carrega dados Google Sheets do JSON
  async loadGoogleSheetsData() {
    try {
      const response = await fetch(`${this.dataPath}metricas-google-sheets.json`);
      return await response.json();
    } catch (error) {
      console.error('Erro ao carregar Google Sheets:', error);
      return this.getFallbackGoogleSheetsData();
    }
  }

  // Parser CSV simples
  parseCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      rows.push(row);
    }

    return { headers, rows };
  }

  // Processa dados de vendas para insights
  async processVendasInsights() {
    const vendasData = await this.loadVendasCSV();
    
    if (!vendasData.rows || vendasData.rows.length === 0) {
      return this.getFallbackVendasInsights();
    }

    const rows = vendasData.rows;
    
    // Calcula métricas principais
    const receitaTotal = rows.reduce((sum, row) => {
      const receita = parseFloat(row.Receita || row.receita || 0);
      return sum + (isNaN(receita) ? 0 : receita);
    }, 0);

    const vendasTotal = rows.length;
    const ticketMedio = receitaTotal / vendasTotal;

    // Vendas por categoria
    const vendasPorCategoria = {};
    rows.forEach(row => {
      const categoria = row.Categoria || row.categoria || 'Outros';
      if (!vendasPorCategoria[categoria]) {
        vendasPorCategoria[categoria] = { vendas: 0, receita: 0 };
      }
      vendasPorCategoria[categoria].vendas += 1;
      vendasPorCategoria[categoria].receita += parseFloat(row.Receita || row.receita || 0);
    });

    // Vendas por região
    const vendasPorRegiao = {};
    rows.forEach(row => {
      const regiao = row.Região || row.regiao || row.Regiao || 'Não informado';
      if (!vendasPorRegiao[regiao]) {
        vendasPorRegiao[regiao] = { vendas: 0, receita: 0 };
      }
      vendasPorRegiao[regiao].vendas += 1;
      vendasPorRegiao[regiao].receita += parseFloat(row.Receita || row.receita || 0);
    });

    // Performance por vendedor
    const performanceVendedor = {};
    rows.forEach(row => {
      const vendedor = row.Vendedor || row.vendedor || 'N/A';
      if (!performanceVendedor[vendedor]) {
        performanceVendedor[vendedor] = { vendas: 0, receita: 0 };
      }
      performanceVendedor[vendedor].vendas += 1;
      performanceVendedor[vendedor].receita += parseFloat(row.Receita || row.receita || 0);
    });

    return {
      resumo: {
        receita_total: receitaTotal,
        vendas_total: vendasTotal,
        ticket_medio: ticketMedio,
        categoria_top: Object.keys(vendasPorCategoria).reduce((a, b) => 
          vendasPorCategoria[a].receita > vendasPorCategoria[b].receita ? a : b
        )
      },
      por_categoria: Object.entries(vendasPorCategoria).map(([categoria, dados]) => ({
        categoria,
        vendas: dados.vendas,
        receita: dados.receita,
        ticket_medio: dados.receita / dados.vendas
      })),
      por_regiao: Object.entries(vendasPorRegiao).map(([regiao, dados]) => ({
        regiao,
        vendas: dados.vendas,
        receita: dados.receita
      })),
      top_vendedores: Object.entries(performanceVendedor)
        .map(([vendedor, dados]) => ({
          vendedor,
          vendas: dados.vendas,
          receita: dados.receita
        }))
        .sort((a, b) => b.receita - a.receita)
        .slice(0, 5)
    };
  }

  // Processa métricas profissionais para insights
  async processMetricasInsights() {
    const metricasData = await this.loadMetricasProfissionais();
    
    if (!metricasData.rows || metricasData.rows.length === 0) {
      return this.getFallbackMetricasInsights();
    }

    const rows = metricasData.rows;
    
    // Agrupa métricas por categoria
    const metricasPorCategoria = {};
    rows.forEach(row => {
      const categoria = row.Categoria || row.categoria || 'Geral';
      if (!metricasPorCategoria[categoria]) {
        metricasPorCategoria[categoria] = [];
      }
      
      metricasPorCategoria[categoria].push({
        metrica: row.Metrica || row.metrica || row.nome,
        valor_atual: parseFloat(row.Valor_Atual || row.valor_atual || 0),
        meta: parseFloat(row.Meta || row.meta || 0),
        status: row.Status || row.status || 'N/A',
        unidade: row.Unidade || row.unidade || '',
        responsavel: row.Responsavel || row.responsavel || 'N/A'
      });
    });

    // KPIs principais
    const kpisPrincipais = this.extractKPIs(rows);
    
    // Status geral das métricas
    const statusMetricas = {
      acima_meta: 0,
      dentro_meta: 0,
      abaixo_meta: 0
    };

    rows.forEach(row => {
      const status = row.Status || row.status || '';
      if (status.includes('Above') || status.includes('Acima')) {
        statusMetricas.acima_meta++;
      } else if (status.includes('Below') || status.includes('Abaixo')) {
        statusMetricas.abaixo_meta++;
      } else {
        statusMetricas.dentro_meta++;
      }
    });

    return {
      kpis_principais: kpisPrincipais,
      por_categoria: metricasPorCategoria,
      status_geral: statusMetricas,
      total_metricas: rows.length,
      areas_atencao: this.identifyAreasAtencao(rows),
      pontos_fortes: this.identifyPontosFortes(rows)
    };
  }

  extractKPIs(rows) {
    const kpis = {};
    
    rows.forEach(row => {
      const metrica = (row.Metrica || row.metrica || '').toLowerCase();
      const valor = parseFloat(row.Valor_Atual || row.valor_atual || 0);
      
      if (metrica.includes('revenue') || metrica.includes('receita')) {
        kpis.receita = valor;
      } else if (metrica.includes('users') || metrica.includes('usuarios')) {
        kpis.usuarios = valor;
      } else if (metrica.includes('conversion') || metrica.includes('conversao')) {
        kpis.conversao = valor;
      } else if (metrica.includes('satisfaction') || metrica.includes('satisfacao')) {
        kpis.satisfacao = valor;
      } else if (metrica.includes('nps')) {
        kpis.nps = valor;
      } else if (metrica.includes('churn')) {
        kpis.churn = valor;
      }
    });
    
    return kpis;
  }

  identifyAreasAtencao(rows) {
    return rows
      .filter(row => {
        const status = row.Status || row.status || '';
        return status.includes('Below') || status.includes('Abaixo');
      })
      .map(row => ({
        metrica: row.Metrica || row.metrica,
        categoria: row.Categoria || row.categoria,
        valor_atual: parseFloat(row.Valor_Atual || row.valor_atual || 0),
        meta: parseFloat(row.Meta || row.meta || 0)
      }))
      .slice(0, 5);
  }

  identifyPontosFortes(rows) {
    return rows
      .filter(row => {
        const status = row.Status || row.status || '';
        return status.includes('Above') || status.includes('Acima');
      })
      .map(row => ({
        metrica: row.Metrica || row.metrica,
        categoria: row.Categoria || row.categoria,
        valor_atual: parseFloat(row.Valor_Atual || row.valor_atual || 0),
        meta: parseFloat(row.Meta || row.meta || 0)
      }))
      .slice(0, 5);
  }

  // Dados de fallback caso não consiga carregar os arquivos
  getFallbackVendasData() {
    return {
      headers: ['Data', 'Produto', 'Categoria', 'Vendas', 'Receita', 'Região'],
      rows: []
    };
  }

  getFallbackVendasInsights() {
    return {
      resumo: {
        receita_total: 2850000,
        vendas_total: 1247,
        ticket_medio: 2285,
        categoria_top: 'Tecnologia'
      },
      por_categoria: [
        { categoria: 'Tecnologia', vendas: 850, receita: 1920000, ticket_medio: 2258 },
        { categoria: 'Móveis', vendas: 297, receita: 680000, ticket_medio: 2290 },
        { categoria: 'Casa', vendas: 100, receita: 250000, ticket_medio: 2500 }
      ],
      por_regiao: [
        { regiao: 'Sudeste', vendas: 485, receita: 1140000 },
        { regiao: 'Sul', vendas: 312, receita: 712000 },
        { regiao: 'Nordeste', vendas: 250, receita: 570000 },
        { regiao: 'Norte', vendas: 125, receita: 285000 },
        { regiao: 'Centro-Oeste', vendas: 75, receita: 143000 }
      ],
      top_vendedores: [
        { vendedor: 'João Silva', vendas: 95, receita: 218000 },
        { vendedor: 'Maria Santos', vendas: 87, receita: 201000 },
        { vendedor: 'Carlos Lima', vendas: 82, receita: 189000 }
      ]
    };
  }

  getFallbackMetricasData() {
    return {
      headers: ['Categoria', 'Metrica', 'Valor_Atual', 'Meta', 'Status'],
      rows: []
    };
  }

  getFallbackMetricasInsights() {
    return {
      kpis_principais: {
        receita: 285833,
        usuarios: 12847,
        conversao: 3.2,
        satisfacao: 4.8,
        nps: 72,
        churn: 2.8
      },
      por_categoria: {
        'Financial': [
          { metrica: 'MRR', valor_atual: 285833, meta: 275000, status: 'Above Target' }
        ],
        'Customer': [
          { metrica: 'NPS', valor_atual: 72, meta: 65, status: 'Above Target' }
        ]
      },
      status_geral: {
        acima_meta: 28,
        dentro_meta: 15,
        abaixo_meta: 7
      },
      total_metricas: 50,
      areas_atencao: [],
      pontos_fortes: []
    };
  }

  getFallbackGoogleSheetsData() {
    return {
      spreadsheetId: "demo-spreadsheet",
      title: "Métricas Demo",
      sheets: [],
      lastUpdate: new Date().toISOString()
    };
  }
}

export default new FileDataLoader();