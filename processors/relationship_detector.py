"""
Smart Relationship Detector
Analyzes multiple datasets to find correlations and suggest dashboard configurations
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Any, Tuple
import logging
from itertools import combinations

logger = logging.getLogger(__name__)

class RelationshipDetector:
    """Detects relationships between multiple datasets and suggests optimal dashboards"""
    
    def __init__(self):
        self.datasets = {}
        self.relationships = []
        self.dashboard_suggestions = []
    
    def analyze_multiple_datasets(self, datasets: Dict[str, pd.DataFrame]) -> Dict[str, Any]:
        """
        Analyze multiple datasets and detect relationships
        
        Args:
            datasets: Dictionary with filename as key and DataFrame as value
            
        Returns:
            Dictionary with relationship analysis and dashboard suggestions
        """
        self.datasets = datasets
        
        # Step 1: Detect relationships between datasets
        self.relationships = self._find_relationships()
        
        # Step 2: Generate dashboard suggestions based on relationships
        self.dashboard_suggestions = self._generate_dashboard_suggestions()
        
        # Step 3: Create merged datasets for analysis
        merged_data = self._create_merged_datasets()
        
        return {
            "relationships": self.relationships,
            "dashboard_suggestions": self.dashboard_suggestions,
            "merged_data": merged_data,
            "analysis_summary": self._create_analysis_summary()
        }
    
    def _find_relationships(self) -> List[Dict[str, Any]]:
        """Find relationships between datasets based on common columns"""
        relationships = []
        
        # Compare each pair of datasets
        for (name1, df1), (name2, df2) in combinations(self.datasets.items(), 2):
            common_columns = self._find_common_columns(df1, df2)
            
            if common_columns:
                relationship = {
                    "dataset1": name1,
                    "dataset2": name2,
                    "common_columns": common_columns,
                    "relationship_type": self._classify_relationship(df1, df2, common_columns),
                    "join_quality": self._assess_join_quality(df1, df2, common_columns)
                }
                relationships.append(relationship)
        
        return relationships
    
    def _find_common_columns(self, df1: pd.DataFrame, df2: pd.DataFrame) -> List[Dict[str, Any]]:
        """Find columns that exist in both datasets and might be joinable - OPTIMIZED"""
        common_columns = []
        
        # Quick optimization: pre-filter likely columns
        likely_join_columns = []
        for col in df1.columns:
            col_lower = col.lower()
            if any(key in col_lower for key in ['id', 'codigo', 'produto', 'cliente', 'vendedor', 'filial']):
                likely_join_columns.append(col)
        
        # If no obvious join columns, take first 5 columns from each dataset
        if not likely_join_columns:
            likely_join_columns = df1.columns[:5].tolist()
        
        for col1 in likely_join_columns:
            for col2 in df2.columns[:10]:  # Limit comparison to first 10 columns
                # Exact match
                if col1.lower() == col2.lower():
                    similarity = self._calculate_column_similarity(df1[col1], df2[col2])
                    if similarity > 0.1:  # Lower threshold for faster processing
                        common_columns.append({
                            "column1": col1,
                            "column2": col2,
                            "similarity": similarity,
                            "match_type": "exact"
                        })
                
                # Partial match for key patterns (only for likely keys)
                elif self._is_likely_key_relationship(col1, col2):
                    similarity = self._calculate_column_similarity(df1[col1], df2[col2])
                    if similarity > 0.05:  # Lower threshold
                        common_columns.append({
                            "column1": col1,
                            "column2": col2,
                            "similarity": similarity,
                            "match_type": "key_pattern"
                        })
        
        return common_columns
    
    def _is_likely_key_relationship(self, col1: str, col2: str) -> bool:
        """Check if two columns are likely to be related keys"""
        col1_lower = col1.lower()
        col2_lower = col2.lower()
        
        # Common key patterns
        key_patterns = [
            ('id_produto', 'produto'),
            ('id_filial', 'filial'),
            ('codigo', 'id'),
            ('produto', 'item'),
            ('cliente', 'customer'),
            ('vendedor', 'seller')
        ]
        
        for pattern1, pattern2 in key_patterns:
            if (pattern1 in col1_lower and pattern2 in col2_lower) or \
               (pattern2 in col1_lower and pattern1 in col2_lower):
                return True
        
        return False
    
    def _calculate_column_similarity(self, series1: pd.Series, series2: pd.Series) -> float:
        """Calculate similarity between two columns based on overlapping values - OPTIMIZED"""
        try:
            # Quick optimization: limit sample size for large datasets
            max_sample = 1000
            if len(series1) > max_sample:
                series1 = series1.sample(max_sample)
            if len(series2) > max_sample:
                series2 = series2.sample(max_sample)
            
            # Convert to sets for comparison
            values1 = set(series1.dropna().astype(str))
            values2 = set(series2.dropna().astype(str))
            
            if not values1 or not values2:
                return 0.0
            
            # Fast check for exact column name match
            if series1.name and series2.name and series1.name.lower() == series2.name.lower():
                return 0.9  # High similarity for exact name match
            
            # Calculate Jaccard similarity with optimization
            intersection = len(values1.intersection(values2))
            union = len(values1.union(values2))
            
            return intersection / union if union > 0 else 0.0
        
        except Exception as e:
            logger.warning(f"Error calculating similarity: {e}")
            return 0.0
    
    def _classify_relationship(self, df1: pd.DataFrame, df2: pd.DataFrame, 
                              common_columns: List[Dict]) -> str:
        """Classify the type of relationship between datasets"""
        if not common_columns:
            return "none"
        
        best_similarity = max(col["similarity"] for col in common_columns)
        
        if best_similarity > 0.8:
            return "strong_join"
        elif best_similarity > 0.3:
            return "moderate_join"
        else:
            return "weak_join"
    
    def _assess_join_quality(self, df1: pd.DataFrame, df2: pd.DataFrame, 
                            common_columns: List[Dict]) -> Dict[str, Any]:
        """Assess the quality of potential joins"""
        if not common_columns:
            return {"quality": "poor", "score": 0}
        
        best_column = max(common_columns, key=lambda x: x["similarity"])
        col1_name = best_column["column1"]
        col2_name = best_column["column2"]
        
        # Calculate join statistics
        values1 = set(df1[col1_name].dropna().astype(str))
        values2 = set(df2[col2_name].dropna().astype(str))
        
        intersection = len(values1.intersection(values2))
        total_unique = len(values1.union(values2))
        
        quality_score = intersection / total_unique if total_unique > 0 else 0
        
        if quality_score > 0.7:
            quality = "excellent"
        elif quality_score > 0.4:
            quality = "good"
        elif quality_score > 0.2:
            quality = "fair"
        else:
            quality = "poor"
        
        return {
            "quality": quality,
            "score": round(quality_score, 3),
            "matching_values": intersection,
            "total_unique": total_unique,
            "best_join_column": best_column
        }
    
    def _generate_dashboard_suggestions(self) -> List[Dict[str, Any]]:
        """Generate dashboard suggestions based on detected relationships"""
        suggestions = []
        
        # Analyze data patterns across all datasets
        all_patterns = self._analyze_combined_patterns()
        
        # Sales Dashboard suggestion
        if self._has_sales_pattern():
            seasonal_insights = self._generate_seasonal_insights()
            
            dashboard_suggestion = {
                "type": "sales_dashboard",
                "title": "Dashboard de Vendas",
                "description": "Análise de vendas por região, vendedor e produto",
                "charts": self._suggest_sales_charts(),
                "kpis": ["Total de Vendas", "Ticket Médio", "Produtos Mais Vendidos", "Performance por Filial"],
                "priority": "high"
            }
            
            # Add seasonal intelligence if available
            if seasonal_insights.get("has_seasonal_data"):
                dashboard_suggestion["seasonal_insights"] = seasonal_insights
                dashboard_suggestion["description"] += " + Inteligência Sazonal"
                dashboard_suggestion["kpis"].extend(["Oportunidades Sazonais", "Previsão de Demanda"])
            
            suggestions.append(dashboard_suggestion)
        
        # Inventory Dashboard suggestion
        if self._has_inventory_pattern():
            suggestions.append({
                "type": "inventory_dashboard", 
                "title": "Dashboard de Estoque",
                "description": "Controle de estoque e análise de produtos",
                "charts": self._suggest_inventory_charts(),
                "kpis": ["Produtos em Estoque", "Estoque Crítico", "Giro de Estoque", "Valor do Estoque"],
                "priority": "medium"
            })
        
        # Regional Dashboard suggestion
        if self._has_geographical_pattern():
            suggestions.append({
                "type": "regional_dashboard",
                "title": "Dashboard Regional", 
                "description": "Performance por região e análise geográfica",
                "charts": self._suggest_geographical_charts(),
                "kpis": ["Vendas por Estado", "Performance Regional", "Crescimento por Cidade", "Market Share"],
                "priority": "medium"
            })
        
        return suggestions
    
    def _analyze_combined_patterns(self) -> Dict[str, List[str]]:
        """Analyze patterns across all datasets"""
        combined_patterns = {
            "geographical": [],
            "temporal": [],
            "metrics": [],
            "categorical": []
        }
        
        for filename, df in self.datasets.items():
            for col in df.columns:
                col_lower = col.lower()
                
                if any(geo in col_lower for geo in ['cidade', 'estado', 'regiao']):
                    combined_patterns["geographical"].append(f"{filename}.{col}")
                
                if any(temp in col_lower for temp in ['data', 'date']):
                    combined_patterns["temporal"].append(f"{filename}.{col}")
                
                if df[col].dtype in ['int64', 'float64'] and 'id' not in col_lower:
                    combined_patterns["metrics"].append(f"{filename}.{col}")
                
                if df[col].dtype == 'object' and df[col].nunique() < len(df) * 0.5:
                    combined_patterns["categorical"].append(f"{filename}.{col}")
        
        return combined_patterns
    
    def _has_sales_pattern(self) -> bool:
        """Check if datasets contain sales-related data"""
        sales_indicators = ['venda', 'sales', 'preco', 'valor', 'quantidade', 'vendedor']
        
        for df in self.datasets.values():
            for col in df.columns:
                if any(indicator in col.lower() for indicator in sales_indicators):
                    return True
        return False
    
    def _has_inventory_pattern(self) -> bool:
        """Check if datasets contain inventory-related data"""
        inventory_indicators = ['estoque', 'inventory', 'produto', 'item', 'categoria']
        
        for df in self.datasets.values():
            for col in df.columns:
                if any(indicator in col.lower() for indicator in inventory_indicators):
                    return True
        return False
    
    def _has_geographical_pattern(self) -> bool:
        """Check if datasets contain geographical data"""
        geo_indicators = ['cidade', 'estado', 'regiao', 'endereco', 'cep']
        
        for df in self.datasets.values():
            for col in df.columns:
                if any(indicator in col.lower() for indicator in geo_indicators):
                    return True
        return False
    
    def _suggest_sales_charts(self) -> List[Dict[str, str]]:
        """Suggest specific charts for sales dashboard"""
        charts = [
            {"type": "line", "title": "Vendas ao Longo do Tempo", "description": "Evolução das vendas"},
            {"type": "bar", "title": "Vendas por Vendedor", "description": "Ranking de vendedores"},
            {"type": "pie", "title": "Vendas por Região", "description": "Distribuição geográfica"},
            {"type": "bar", "title": "Top Produtos", "description": "Produtos mais vendidos"}
        ]
        
        # Add seasonal intelligence charts
        seasonal_insights = self._generate_seasonal_insights()
        if seasonal_insights:
            charts.extend([
                {"type": "calendar", "title": "Sazonalidade Inteligente", "description": "Padrões sazonais e oportunidades"},
                {"type": "forecast", "title": "Previsão Sazonal", "description": "Projeções baseadas em feriados"}
            ])
        
        return charts
    
    def _suggest_inventory_charts(self) -> List[Dict[str, str]]:
        """Suggest specific charts for inventory dashboard"""
        return [
            {"type": "gauge", "title": "Nível de Estoque", "description": "Status geral do estoque"},
            {"type": "bar", "title": "Produtos em Baixa", "description": "Itens com estoque crítico"},
            {"type": "treemap", "title": "Valor por Categoria", "description": "Distribuição do valor em estoque"}
        ]
    
    def _suggest_geographical_charts(self) -> List[Dict[str, str]]:
        """Suggest specific charts for geographical dashboard"""
        return [
            {"type": "map", "title": "Mapa de Vendas", "description": "Vendas por estado/região"},
            {"type": "bar", "title": "Performance Regional", "description": "Comparação entre regiões"},
            {"type": "heatmap", "title": "Densidade de Clientes", "description": "Concentração por cidade"}
        ]
    
    def _create_merged_datasets(self) -> Dict[str, Any]:
        """Create merged datasets based on detected relationships"""
        merged_datasets = {}
        
        # Find the best relationships for merging
        strong_relationships = [r for r in self.relationships if r["relationship_type"] == "strong_join"]
        
        if strong_relationships:
            # Create a comprehensive merged dataset
            master_df = None
            join_sequence = []
            
            for rel in strong_relationships:
                dataset1 = self.datasets[rel["dataset1"]]
                dataset2 = self.datasets[rel["dataset2"]]
                best_join = rel["join_quality"]["best_join_column"]
                
                if master_df is None:
                    # Start with first relationship
                    master_df = dataset1.merge(
                        dataset2, 
                        left_on=best_join["column1"], 
                        right_on=best_join["column2"], 
                        how="inner",
                        suffixes=('', '_right')
                    )
                    join_sequence.append(f"{rel['dataset1']} ⟷ {rel['dataset2']}")
                else:
                    # Try to add more datasets
                    try:
                        if rel["dataset1"] not in str(join_sequence):
                            master_df = master_df.merge(
                                dataset1,
                                left_on=best_join["column2"],
                                right_on=best_join["column1"],
                                how="left",
                                suffixes=('', '_new')
                            )
                            join_sequence.append(f"+ {rel['dataset1']}")
                    except Exception as e:
                        logger.warning(f"Could not merge {rel['dataset1']}: {e}")
            
            if master_df is not None:
                # Convert NaN to None for JSON serialization
                master_data = master_df.head(100).fillna(None).to_dict('records')
                merged_datasets["master_dataset"] = {
                    "data": master_data,
                    "total_rows": len(master_df),
                    "columns": master_df.columns.tolist(),
                    "join_sequence": join_sequence
                }
        
        return merged_datasets
    
    def _create_analysis_summary(self) -> Dict[str, Any]:
        """Create a summary of the relationship analysis"""
        return {
            "total_datasets": len(self.datasets),
            "total_relationships": len(self.relationships),
            "strong_relationships": len([r for r in self.relationships if r["relationship_type"] == "strong_join"]),
            "suggested_dashboards": len(self.dashboard_suggestions),
            "data_quality": self._assess_overall_data_quality(),
            "recommended_action": self._recommend_next_action()
        }
    
    def _assess_overall_data_quality(self) -> str:
        """Assess overall data quality across all datasets"""
        if not self.relationships:
            return "poor"
        
        avg_similarity = np.mean([
            max(rel["common_columns"], key=lambda x: x["similarity"])["similarity"] 
            for rel in self.relationships if rel["common_columns"]
        ])
        
        if avg_similarity > 0.7:
            return "excellent"
        elif avg_similarity > 0.4:
            return "good"
        elif avg_similarity > 0.2:
            return "fair"
        else:
            return "poor"
    
    def _recommend_next_action(self) -> str:
        """Recommend next action based on analysis"""
        if not self.relationships:
            return "review_data_structure"
        elif len([r for r in self.relationships if r["relationship_type"] == "strong_join"]) > 0:
            return "generate_dashboards"
        else:
            return "improve_data_quality"
    
    def _generate_seasonal_insights(self) -> Dict[str, Any]:
        """Generate seasonal intelligence insights based on embedded calendar"""
        import datetime
        
        # Brazilian commercial calendar + factors that impact sales
        FATORES_VENDAS = {
            "01": {
                "eventos": ["Volta às Aulas", "Início do Ano", "Pagamento 13º"],
                "impacto": "alto", 
                "produtos_alta": "material_escolar,uniformes,eletronicos,academia,dietas",
                "produtos_baixa": "decoracao_natal,roupas_festas",
                "comportamento": "Consumo consciente pós-festas, planejamento ano",
                "economia": "Orçamento apertado pós-festas, IPTU, matrícula escola"
            },
            "02": {
                "eventos": ["Carnaval", "Dia dos Namorados", "Volta trabalho"],
                "impacto": "alto",
                "produtos_alta": "fantasias,presentes,viagens,bebidas",
                "produtos_baixa": "material_escolar,itens_casa", 
                "comportamento": "Foco em lazer e relacionamentos",
                "economia": "Gastos com viagens de carnaval"
            },
            "03": {
                "eventos": ["Dia da Mulher", "Outono", "Fim verão"],
                "impacto": "medio",
                "produtos_alta": "cosmeticos,flores,roupas_inverno",
                "produtos_baixa": "roupas_verao,produtos_praia",
                "comportamento": "Transição de estação, foco feminino",
                "economia": "Estabilização pós-carnaval"
            },
            "04": {
                "eventos": ["Páscoa", "Tiradentes", "Outono consolidado"],
                "impacto": "medio",
                "produtos_alta": "chocolates,brinquedos,turismo_feriado",
                "produtos_baixa": "roupas_verao,ar_condicionado",
                "comportamento": "Período familiar, viagens curtas",
                "economia": "Feriados prolongados, turismo interno"
            },
            "05": {
                "eventos": ["Dia das Mães", "Dia do Trabalho", "Inverno chegando"],
                "impacto": "muito_alto",
                "produtos_alta": "flores,joias,eletrodomesticos,perfumes,agasalhos",
                "produtos_baixa": "ar_condicionado,roupas_verao",
                "comportamento": "Maior data comercial, gratidão maternal",
                "economia": "2º maior faturamento do varejo no ano"
            },
            "06": {
                "eventos": ["Festa Junina", "Inverno", "Férias julho"],
                "impacto": "medio", 
                "produtos_alta": "roupas_inverno,aquecedores,decoracao_junina",
                "produtos_baixa": "ventiladores,roupas_verao",
                "comportamento": "Cultura regional, preparação férias",
                "economia": "Planejamento férias de julho"
            },
            "07": {
                "eventos": ["Férias Escolares", "Inverno forte", "Liquidação inverno"],
                "impacto": "alto",
                "produtos_alta": "viagens,brinquedos,roupas_inverno,jogos",
                "produtos_baixa": "material_escolar,uniformes",
                "comportamento": "Família unida, tempo livre, viagens",
                "economia": "Gastos com férias, turismo nacional"
            },
            "08": {
                "eventos": ["Dia dos Pais", "Fim inverno", "Volta às aulas preparação"],
                "impacto": "alto",
                "produtos_alta": "ferramentas,eletronicos,roupas_masculinas,material_escolar",
                "produtos_baixa": "brinquedos_ferias",
                "comportamento": "Homenagem paterna, preparação volta aulas",
                "economia": "3ª maior data comemorativa do ano"
            },
            "09": {
                "eventos": ["Primavera", "Independência", "Preparação final ano"],
                "impacto": "medio",
                "produtos_alta": "decoracao,flores,roupas_primavera,limpeza",
                "produtos_baixa": "roupas_inverno,aquecedores",
                "comportamento": "Renovação, limpeza, energia",
                "economia": "Preparação para final de ano"
            },
            "10": {
                "eventos": ["Dia das Crianças", "Primavera forte", "Estudantes"],
                "impacto": "muito_alto",
                "produtos_alta": "brinquedos,games,roupas_infantis,eletronicos,livros",
                "produtos_baixa": "roupas_inverno",
                "comportamento": "Foco total nas crianças",
                "economia": "2ª maior data do varejo, competição forte"
            },
            "11": {
                "eventos": ["Black Friday", "Finados", "Verão chegando", "Preparação Natal"],
                "impacto": "muito_alto",
                "produtos_alta": "todos_categorias,eletronicos,roupas_verao",
                "produtos_baixa": "roupas_inverno",
                "comportamento": "Caça às promoções, antecipação compras natal",
                "economia": "Maior evento promocional, liquidação estoque"
            },
            "12": {
                "eventos": ["Natal", "Verão", "Férias", "13º salário", "Réveillon"],
                "impacto": "muito_alto",
                "produtos_alta": "presentes,eletronicos,roupas_festa,decoracao,comidas,bebidas",
                "produtos_baixa": "material_escolar",
                "comportamento": "Generosidade máxima, comemorações",
                "economia": "PICO MÁXIMO - 13º salário, maior faturamento"
            }
        }
        
        current_date = datetime.datetime.now()
        current_month = f"{current_date.month:02d}"
        next_month = f"{(current_date.month % 12) + 1:02d}"
        
        # Get current and next month insights
        current_insight = FATORES_VENDAS.get(current_month, {})
        next_insight = FATORES_VENDAS.get(next_month, {})
        
        # Generate intelligent recommendations
        recommendations = []
        
        if current_insight.get("impacto") in ["alto", "muito_alto"]:
            recommendations.append(
                f"🎯 PERÍODO ATUAL: {'/'.join(current_insight.get('eventos', []))} - Produtos em alta: {current_insight.get('produtos_alta', '')}"
            )
            recommendations.append(
                f"📉 Produtos em baixa: {current_insight.get('produtos_baixa', '')}"
            )
            recommendations.append(
                f"🧠 Comportamento: {current_insight.get('comportamento', '')}"
            )
        
        if next_insight.get("impacto") in ["alto", "muito_alto"]:
            recommendations.append(
                f"📈 PRÓXIMO PERÍODO: {'/'.join(next_insight.get('eventos', []))} - Preparar estoque: {next_insight.get('produtos_alta', '')}"
            )
            recommendations.append(
                f"💰 Contexto econômico: {next_insight.get('economia', '')}"
            )
        
        return {
            "has_seasonal_data": True,
            "current_period": current_insight,
            "next_period": next_insight,
            "seasonal_recommendations": recommendations,
            "monthly_patterns": self._analyze_monthly_patterns(),
            "intelligent_insights": self._generate_intelligent_insights(current_insight, next_insight)
        }
    
    def _generate_seasonal_recommendations(self, upcoming_events) -> List[str]:
        """Generate actionable seasonal recommendations"""
        recommendations = []
        
        # This function is not currently used in the seasonal intelligence
        # Return empty list to avoid errors
        return recommendations
    
    def _analyze_monthly_patterns(self) -> Dict[str, str]:
        """Analyze monthly sales patterns"""
        import datetime
        current_month = datetime.datetime.now().month
        
        # Brazilian commercial calendar insights
        monthly_insights = {
            1: "Volta às aulas - Oportunidade para eletrônicos e material escolar",
            2: "Carnaval - Foco em turismo e lazer",
            3: "Dia da Mulher - Cosméticos e presentes femininos",
            4: "Páscoa - Chocolate e produtos infantis",
            5: "DIA DAS MÃES - Maior oportunidade comercial do ano",
            6: "Festa Junina - Produtos sazonais e decoração",
            7: "Férias escolares - Viagens e lazer",
            8: "Dia dos Pais - Eletrônicos e ferramentas",
            9: "Primavera - Renovação e decoração",
            10: "Dia das Crianças - Segunda maior data do varejo",
            11: "Black Friday - Liquidação e promoções",
            12: "NATAL - Pico máximo de vendas do ano"
        }
        
        return {
            "current_month_insight": monthly_insights.get(current_month, "Período comercial padrão"),
            "next_month_insight": monthly_insights.get(current_month + 1 if current_month < 12 else 1, "Início de novo ciclo")
        }
    
    def _generate_intelligent_insights(self, current_period: Dict, next_period: Dict) -> List[str]:
        """Generate intelligent business insights based on seasonal data"""
        insights = []
        
        if current_period.get("impacto") == "muito_alto":
            insights.append(
                f"⚡ OPORTUNIDADE MÁXIMA: {current_period.get('comportamento', '')} - Maximize campanhas!"
            )
        
        if next_period.get("impacto") == "muito_alto":
            insights.append(
                f"🔮 PREPARAÇÃO CRÍTICA: {next_period.get('economia', '')} - Antecipe compras!"
            )
        
        # Cross-reference products in high vs low demand
        produtos_alta_atual = set(current_period.get("produtos_alta", "").split(","))
        produtos_baixa_atual = set(current_period.get("produtos_baixa", "").split(","))
        
        if produtos_alta_atual and produtos_baixa_atual:
            insights.append(
                f"💡 ESTRATÉGIA: Promover {', '.join(list(produtos_baixa_atual)[:2])} para abrir espaço para {', '.join(list(produtos_alta_atual)[:2])}"
            )
        
        return insights