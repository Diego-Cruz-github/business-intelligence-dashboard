"""
Smart Dashboard Generator - DataHub Universal Centralizer
Gerador inteligente que analisa dados e cria dashboards otimizados automaticamente
"""

import pandas as pd
import numpy as np
import json
from typing import Dict, List, Tuple, Any
from datetime import datetime, timedelta
import re
from collections import Counter

class SmartDashboardGenerator:
    def __init__(self):
        self.data_patterns = {}
        self.chart_recommendations = {}
        self.kpi_suggestions = {}
        
    def analyze_data_structure(self, df: pd.DataFrame, data_source: str = "unknown") -> Dict:
        """Analisa estrutura dos dados e sugere visualizações"""
        analysis = {
            'source': data_source,
            'rows': len(df),
            'columns': len(df.columns),
            'data_types': {},
            'patterns': {},
            'quality_score': 0,
            'recommendations': {}
        }
        
        # Análise de tipos de dados
        for col in df.columns:
            dtype = str(df[col].dtype)
            null_pct = (df[col].isnull().sum() / len(df)) * 100
            unique_values = df[col].nunique()
            
            analysis['data_types'][col] = {
                'type': dtype,
                'null_percentage': round(null_pct, 2),
                'unique_values': unique_values,
                'sample_values': df[col].dropna().head(3).tolist() if not df[col].empty else []
            }
            
        # Detectar padrões de dados
        analysis['patterns'] = self._detect_data_patterns(df)
        
        # Calcular score de qualidade
        analysis['quality_score'] = self._calculate_data_quality(df)
        
        # Gerar recomendações de visualização
        analysis['recommendations'] = self._generate_visualization_recommendations(df, analysis)
        
        return analysis
    
    def _detect_data_patterns(self, df: pd.DataFrame) -> Dict:
        """Detecta padrões nos dados"""
        patterns = {
            'temporal_columns': [],
            'categorical_columns': [],
            'numerical_columns': [],
            'metric_columns': [],
            'dimension_columns': [],
            'kpi_candidates': [],
            'financial_indicators': [],
            'performance_indicators': []
        }
        
        for col in df.columns:
            col_lower = col.lower()
            
            # Colunas temporais
            if any(term in col_lower for term in ['data', 'date', 'time', 'periodo', 'mes', 'ano']):
                patterns['temporal_columns'].append(col)
            
            # Indicadores financeiros
            elif any(term in col_lower for term in ['receita', 'revenue', 'custo', 'cost', 'lucro', 'profit', 'margem', 'valor', 'preco']):
                patterns['financial_indicators'].append(col)
                patterns['metric_columns'].append(col)
            
            # Indicadores de performance
            elif any(term in col_lower for term in ['taxa', 'rate', 'score', 'nps', 'satisfacao', 'churn', 'cac', 'ltv', 'roas', 'roi']):
                patterns['performance_indicators'].append(col)
                patterns['kpi_candidates'].append(col)
            
            # Colunas numéricas
            elif df[col].dtype in ['int64', 'float64']:
                patterns['numerical_columns'].append(col)
                
                # Se tem muitos valores únicos, provavelmente é métrica
                if df[col].nunique() > len(df) * 0.7:
                    patterns['metric_columns'].append(col)
                else:
                    patterns['kpi_candidates'].append(col)
            
            # Colunas categóricas
            elif df[col].dtype == 'object' or df[col].nunique() < 20:
                patterns['categorical_columns'].append(col)
                patterns['dimension_columns'].append(col)
        
        return patterns
    
    def _calculate_data_quality(self, df: pd.DataFrame) -> float:
        """Calcula score de qualidade dos dados"""
        total_cells = df.shape[0] * df.shape[1]
        null_cells = df.isnull().sum().sum()
        completeness = (total_cells - null_cells) / total_cells
        
        # Verifica consistência de tipos
        consistency_score = 0
        for col in df.columns:
            if df[col].dtype == 'object':
                # Para colunas de texto, verifica se há padrões consistentes
                non_null = df[col].dropna()
                if len(non_null) > 0:
                    avg_length = non_null.str.len().mean()
                    std_length = non_null.str.len().std()
                    if std_length < avg_length * 0.5:  # Baixo desvio padrão indica consistência
                        consistency_score += 1
            else:
                consistency_score += 1
        
        consistency = consistency_score / len(df.columns)
        
        # Score final (0-100)
        quality_score = (completeness * 0.6 + consistency * 0.4) * 100
        
        return round(quality_score, 1)
    
    def _generate_visualization_recommendations(self, df: pd.DataFrame, analysis: Dict) -> Dict:
        """Gera recomendações de visualização baseadas nos padrões detectados"""
        recommendations = {
            'kpi_cards': [],
            'line_charts': [],
            'bar_charts': [],
            'pie_charts': [],
            'heatmaps': [],
            'scatter_plots': [],
            'tables': [],
            'priority_score': {}
        }
        
        patterns = analysis['patterns']
        
        # KPI Cards - para métricas importantes
        for col in patterns['kpi_candidates'] + patterns['performance_indicators']:
            if col in patterns['numerical_columns']:
                current_value = df[col].iloc[-1] if len(df) > 0 else 0
                previous_value = df[col].iloc[-2] if len(df) > 1 else current_value
                trend = 'up' if current_value > previous_value else 'down' if current_value < previous_value else 'stable'
                
                recommendations['kpi_cards'].append({
                    'title': self._format_title(col),
                    'column': col,
                    'current_value': current_value,
                    'previous_value': previous_value,
                    'trend': trend,
                    'format': self._determine_format(col),
                    'priority': self._calculate_priority(col, df)
                })
        
        # Line Charts - para séries temporais
        if patterns['temporal_columns']:
            time_col = patterns['temporal_columns'][0]
            for metric_col in patterns['metric_columns'][:3]:  # Top 3 métricas
                recommendations['line_charts'].append({
                    'title': f'{self._format_title(metric_col)} ao Longo do Tempo',
                    'x_axis': time_col,
                    'y_axis': metric_col,
                    'chart_type': 'line',
                    'priority': self._calculate_priority(metric_col, df)
                })
        
        # Bar Charts - para comparações categóricas
        for dim_col in patterns['dimension_columns'][:2]:
            for metric_col in patterns['metric_columns'][:2]:
                recommendations['bar_charts'].append({
                    'title': f'{self._format_title(metric_col)} por {self._format_title(dim_col)}',
                    'x_axis': dim_col,
                    'y_axis': metric_col,
                    'chart_type': 'bar',
                    'priority': self._calculate_priority(metric_col, df)
                })
        
        # Pie Charts - para distribuições
        for dim_col in patterns['dimension_columns']:
            if df[dim_col].nunique() <= 8:  # Máximo 8 categorias para pie chart
                recommendations['pie_charts'].append({
                    'title': f'Distribuição por {self._format_title(dim_col)}',
                    'dimension': dim_col,
                    'measure': 'count',
                    'chart_type': 'doughnut',
                    'priority': 2
                })
        
        # Tables - para dados detalhados
        important_cols = (patterns['kpi_candidates'] + 
                         patterns['financial_indicators'] + 
                         patterns['performance_indicators'])[:8]
        
        if important_cols:
            recommendations['tables'].append({
                'title': 'Dados Detalhados',
                'columns': important_cols,
                'sortable': True,
                'filterable': True,
                'priority': 1
            })
        
        # Calcular prioridades finais
        for category in recommendations:
            if category != 'priority_score' and isinstance(recommendations[category], list):
                recommendations[category].sort(key=lambda x: x.get('priority', 0), reverse=True)
        
        return recommendations
    
    def _format_title(self, column_name: str) -> str:
        """Formata nome da coluna para título"""
        # Remove underscores e capitaliza
        title = column_name.replace('_', ' ').replace('-', ' ')
        
        # Capitaliza cada palavra
        title = ' '.join(word.capitalize() for word in title.split())
        
        # Correções específicas para português
        corrections = {
            'Receita': 'Receita',
            'Lucro': 'Lucro',
            'Margem': 'Margem',
            'Taxa': 'Taxa',
            'Nps': 'NPS',
            'Cac': 'CAC',
            'Ltv': 'LTV',
            'Roas': 'ROAS',
            'Roi': 'ROI'
        }
        
        for old, new in corrections.items():
            title = title.replace(old, new)
        
        return title
    
    def _determine_format(self, column_name: str) -> str:
        """Determina formato de exibição baseado no nome da coluna"""
        col_lower = column_name.lower()
        
        if any(term in col_lower for term in ['receita', 'revenue', 'custo', 'cost', 'valor', 'preco']):
            return 'currency'
        elif any(term in col_lower for term in ['taxa', 'rate', 'margem', 'percentage', '%']):
            return 'percentage'
        elif any(term in col_lower for term in ['score', 'rating', 'nota']):
            return 'decimal'
        else:
            return 'number'
    
    def _calculate_priority(self, column_name: str, df: pd.DataFrame) -> int:
        """Calcula prioridade da métrica baseada em importância"""
        col_lower = column_name.lower()
        priority = 1
        
        # Métricas financeiras têm alta prioridade
        if any(term in col_lower for term in ['receita', 'revenue', 'lucro', 'profit']):
            priority += 4
        
        # Métricas de performance
        elif any(term in col_lower for term in ['nps', 'satisfacao', 'churn', 'conversao']):
            priority += 3
        
        # Métricas de eficiência
        elif any(term in col_lower for term in ['cac', 'ltv', 'roas', 'roi']):
            priority += 3
        
        # Verifica variabilidade dos dados (mais variável = mais interessante)
        if df[column_name].dtype in ['int64', 'float64']:
            cv = df[column_name].std() / df[column_name].mean() if df[column_name].mean() != 0 else 0
            if cv > 0.2:  # Coeficiente de variação alto
                priority += 1
        
        return min(priority, 5)  # Máximo 5
    
    def generate_dashboard_config(self, analysis_results: List[Dict]) -> Dict:
        """Gera configuração completa do dashboard baseada em múltiplas análises"""
        dashboard_config = {
            'title': 'Dashboard Executivo',
            'subtitle': 'Análise Unificada de Dados Empresariais',
            'layout': {
                'kpi_section': {'position': 'top', 'columns': 4},
                'charts_section': {'position': 'middle', 'columns': 2},
                'tables_section': {'position': 'bottom', 'columns': 1}
            },
            'components': {
                'kpi_cards': [],
                'charts': [],
                'tables': []
            },
            'real_time': True,
            'refresh_interval': 300,  # 5 minutos
            'data_quality': 'excellent',
            'last_update': datetime.now().isoformat()
        }
        
        # Consolida todas as recomendações
        all_kpis = []
        all_charts = []
        all_tables = []
        
        for analysis in analysis_results:
            recommendations = analysis.get('recommendations', {})
            
            # Coleta KPIs
            for kpi in recommendations.get('kpi_cards', []):
                kpi['source'] = analysis['source']
                all_kpis.append(kpi)
            
            # Coleta Charts
            for chart_type in ['line_charts', 'bar_charts', 'pie_charts']:
                for chart in recommendations.get(chart_type, []):
                    chart['source'] = analysis['source']
                    all_charts.append(chart)
            
            # Coleta Tables
            for table in recommendations.get('tables', []):
                table['source'] = analysis['source']
                all_tables.append(table)
        
        # Seleciona top componentes por prioridade
        dashboard_config['components']['kpi_cards'] = sorted(all_kpis, 
                                                           key=lambda x: x.get('priority', 0), 
                                                           reverse=True)[:8]
        
        dashboard_config['components']['charts'] = sorted(all_charts, 
                                                        key=lambda x: x.get('priority', 0), 
                                                        reverse=True)[:6]
        
        dashboard_config['components']['tables'] = sorted(all_tables, 
                                                        key=lambda x: x.get('priority', 0), 
                                                        reverse=True)[:2]
        
        # Calcula score geral de qualidade
        quality_scores = [a.get('quality_score', 0) for a in analysis_results]
        dashboard_config['overall_quality'] = sum(quality_scores) / len(quality_scores) if quality_scores else 0
        
        return dashboard_config
    
    def export_dashboard_config(self, config: Dict, output_path: str) -> bool:
        """Exporta configuração do dashboard para arquivo JSON"""
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(config, f, indent=2, ensure_ascii=False, default=str)
            return True
        except Exception as e:
            print(f"Erro ao exportar configuração: {e}")
            return False

# Função utilitária para processar múltiplos arquivos
def process_multiple_data_sources(file_paths: List[str]) -> Dict:
    """Processa múltiplos arquivos e gera dashboard unificado"""
    generator = SmartDashboardGenerator()
    analysis_results = []
    
    for file_path in file_paths:
        try:
            # Detecta tipo do arquivo e carrega
            if file_path.endswith('.csv'):
                df = pd.read_csv(file_path)
                source_name = file_path.split('/')[-1].replace('.csv', '')
            elif file_path.endswith('.xlsx'):
                df = pd.read_excel(file_path)
                source_name = file_path.split('/')[-1].replace('.xlsx', '')
            elif file_path.endswith('.json'):
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                df = pd.json_normalize(data)
                source_name = file_path.split('/')[-1].replace('.json', '')
            else:
                continue
            
            # Analisa dados
            analysis = generator.analyze_data_structure(df, source_name)
            analysis_results.append(analysis)
            
        except Exception as e:
            print(f"Erro ao processar {file_path}: {e}")
    
    # Gera configuração final do dashboard
    dashboard_config = generator.generate_dashboard_config(analysis_results)
    
    return {
        'dashboard_config': dashboard_config,
        'analysis_results': analysis_results,
        'summary': {
            'files_processed': len(analysis_results),
            'total_rows': sum(a['rows'] for a in analysis_results),
            'total_columns': sum(a['columns'] for a in analysis_results),
            'average_quality': dashboard_config['overall_quality']
        }
    }

if __name__ == "__main__":
    # Exemplo de uso
    test_files = [
        'test-data/vendas-2024.csv',
        'test-data/metricas-profissionais-avancadas.csv'
    ]
    
    result = process_multiple_data_sources(test_files)
    print(json.dumps(result['summary'], indent=2, ensure_ascii=False))