# MVP DataHub - Backend Simples e Funcional
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import os
from datetime import datetime
from collections import OrderedDict

app = Flask(__name__)
CORS(app)

# Storage simples em memória
uploaded_data = {}

# Funções auxiliares para detecção de colunas
def detectar_coluna_valor(dados):
    """Detecta automaticamente a coluna de valores monetários"""
    for linha in dados:
        for col in linha.keys():
            col_lower = col.lower()
            if any(palavra in col_lower for palavra in ['valor_total', 'valor', 'vendas', 'receita', 'mrr', 'contrato']):
                try:
                    float(linha[col])
                    return col
                except:
                    continue
    return None

def detectar_coluna_regiao(dados):
    """Detecta automaticamente a coluna de região/localização"""
    for linha in dados:
        for col in linha.keys():
            col_lower = col.lower()
            # Priorizar cidade_filial para vendas
            if 'cidade_filial' in col_lower:
                return col
        # Segunda passagem para outras colunas
        for col in linha.keys():
            col_lower = col.lower()
            if any(palavra in col_lower for palavra in ['regiao', 'estado', 'cidade']):
                return col
    return None

def detectar_coluna_produto(dados):
    """Detecta automaticamente a coluna de produtos (prioriza nome_produto)"""
    for linha in dados:
        for col in linha.keys():
            col_lower = col.lower()
            if 'nome_produto' in col_lower:
                return col
        # Segunda passagem para outras colunas se nome_produto não existir
        for col in linha.keys():
            col_lower = col.lower()
            if any(palavra in col_lower for palavra in ['produto', 'item', 'categoria']) and 'id_produto' not in col_lower:
                return col
    return None

def detectar_coluna_vendedor(dados):
    """Detecta automaticamente a coluna de vendedores"""
    for linha in dados:
        for col in linha.keys():
            if 'vendedor' in col.lower():
                return col
    return None

def detectar_coluna_data(dados):
    """Detecta automaticamente a coluna de data"""
    for linha in dados:
        for col in linha.keys():
            if 'data' in col.lower():
                return col
    return None

# Funções de cálculo de métricas
def calcular_vendas_por_regiao(dados, col_regiao, col_valor):
    """Calcula vendas por região"""
    vendas_por_regiao = {}
    for linha in dados:
        regiao = linha.get(col_regiao, 'Outros')
        try:
            valor = float(linha.get(col_valor, 0))
            if regiao not in vendas_por_regiao:
                vendas_por_regiao[regiao] = 0
            vendas_por_regiao[regiao] += valor
        except:
            continue
    return vendas_por_regiao

def calcular_vendas_por_produto(dados, col_produto, col_valor):
    """Calcula vendas e quantidade por produto"""
    vendas_por_produto = {}
    quantidade_por_produto = {}
    for linha in dados:
        produto = linha.get(col_produto, 'Item')
        try:
            valor = float(linha.get(col_valor, 0))
            quantidade = int(linha.get('quantidade', 0))
            
            if produto not in vendas_por_produto:
                vendas_por_produto[produto] = 0
                quantidade_por_produto[produto] = 0
            
            vendas_por_produto[produto] += valor
            quantidade_por_produto[produto] += quantidade
        except:
            continue
    return vendas_por_produto, quantidade_por_produto

def calcular_vendas_por_vendedor(dados, col_vendedor, col_valor):
    """Calcula vendas por vendedor"""
    vendas_por_vendedor = {}
    for linha in dados:
        vendedor = linha.get(col_vendedor)
        if vendedor and col_valor:
            try:
                valor = float(linha.get(col_valor, 0))
                if vendedor not in vendas_por_vendedor:
                    vendas_por_vendedor[vendedor] = 0
                vendas_por_vendedor[vendedor] += valor
            except:
                continue
    return vendas_por_vendedor

def calcular_canais(dados, col_valor):
    """Detecta e calcula vendas por canal (atacado/varejo)"""
    canais = {}
    for linha in dados:
        canal = None
        if 'vendedor' in linha and linha.get('vendedor'):
            canal = 'Varejo'
        elif 'vendedor_responsavel' in linha and linha.get('vendedor_responsavel'):
            canal = 'Atacado'
        elif 'estoque_atual' in linha or 'meta_mensal' in linha:
            continue
        else:
            canal = 'Outros'
            
        if canal and col_valor:
            if canal not in canais:
                canais[canal] = {'total': 0, 'transacoes': 0}
            try:
                valor = float(linha.get(col_valor, 0))
                if valor > 0:
                    canais[canal]['total'] += valor
                    canais[canal]['transacoes'] += 1
            except:
                continue
    
    # Calcular tickets médios
    for canal in canais:
        if canais[canal]['transacoes'] > 0:
            canais[canal]['ticket_medio'] = canais[canal]['total'] / canais[canal]['transacoes']
        else:
            canais[canal]['ticket_medio'] = 0
    
    return canais

def calcular_sazonalidade(dados, col_data, col_valor):
    """Calcula vendas por mês"""
    vendas_por_mes = {}
    for linha in dados:
        data = str(linha.get(col_data, ''))
        if '/' in data and len(data.split('/')) >= 3:
            try:
                mes_ano = f"{data.split('/')[1]}/{data.split('/')[2]}"
                if mes_ano not in vendas_por_mes:
                    vendas_por_mes[mes_ano] = 0
                valor = float(linha.get(col_valor, 0))
                vendas_por_mes[mes_ano] += valor
            except:
                continue
    return vendas_por_mes

def analisar_estoque(dados, col_produto):
    """Analisa dados de estoque"""
    estoque_info = {}
    valor_total_estoque = 0
    
    for linha in dados:
        if 'estoque_atual' in linha:
            nome = linha.get(col_produto, 'Item')
            atual = int(linha.get('estoque_atual', 0))
            minimo = int(linha.get('estoque_minimo', 0))
            preco_varejo = float(linha.get('preco_varejo', 0))
            margem = float(linha.get('margem_varejo', 0))
            
            valor_produto = atual * preco_varejo
            valor_total_estoque += valor_produto
            
            estoque_info[nome] = {
                'atual': atual,
                'minimo': minimo,
                'preco_varejo': preco_varejo,
                'valor_estoque': valor_produto,
                'status': 'CRÍTICO' if atual < minimo else 'OK',
                'margem': margem
            }
    
    return estoque_info, valor_total_estoque

def analisar_metas_vs_vendas(dados, col_valor):
    """Analisa metas vs vendas reais por filial"""
    vendas_por_filial = {}
    metas_por_filial = {}
    
    # Calcular vendas por filial
    for linha in dados:
        if 'id_filial' in linha and col_valor:
            filial = linha.get('id_filial')
            cidade = linha.get('cidade_filial', linha.get('cidade', 'N/A'))
            try:
                valor = float(linha.get(col_valor, 0))
                if filial not in vendas_por_filial:
                    vendas_por_filial[filial] = {'total': 0, 'cidade': cidade}
                vendas_por_filial[filial]['total'] += valor
            except:
                continue
    
    # Obter metas das filiais
    for linha in dados:
        if 'meta_mensal' in linha:
            filial = linha.get('id_filial')
            cidade = linha.get('cidade', 'N/A')
            try:
                meta = float(linha.get('meta_mensal', 0))
                metas_por_filial[filial] = {'meta': meta, 'cidade': cidade}
            except:
                continue
    
    # Comparar metas vs vendas
    resultado = {}
    for filial in metas_por_filial:
        meta = metas_por_filial[filial]['meta']
        cidade = metas_por_filial[filial]['cidade']
        vendas = vendas_por_filial.get(filial, {}).get('total', 0)
        
        percentual = (vendas / meta * 100) if meta > 0 else 0
        status = 'ATINGIDA' if vendas >= meta else 'NÃO ATINGIDA'
        
        resultado[cidade] = {
            'meta': meta,
            'vendas': vendas,
            'percentual': percentual,
            'status': status,
            'diferenca': vendas - meta
        }
    
    return resultado

def listar_todos_produtos(dados, col_produto, col_valor):
    """Lista todos os produtos vendidos com suas informações"""
    produtos_completos = {}
    
    for linha in dados:
        # Pular dados de estoque - não são vendas
        if 'estoque_atual' in linha or 'estoque_minimo' in linha:
            continue
            
        if col_produto and col_valor:
            produto = linha.get(col_produto, 'Item')
            try:
                valor = float(linha.get(col_valor, 0))
                quantidade = int(linha.get('quantidade', 0))
                preco_unit = float(linha.get('preco_unitario', 0))
                
                # Só processar se tiver valor de venda real e produto válido
                if valor > 0 and produto != 'Item' and produto.strip():
                    if produto not in produtos_completos:
                        produtos_completos[produto] = {
                            'total_vendas': 0,
                            'total_quantidade': 0,
                            'preco_unitario': preco_unit,
                            'transacoes': 0
                        }
                    
                    produtos_completos[produto]['total_vendas'] += valor
                    produtos_completos[produto]['total_quantidade'] += quantidade
                    produtos_completos[produto]['transacoes'] += 1
                    
                    # Atualizar preço se necessário
                    if preco_unit > 0:
                        produtos_completos[produto]['preco_unitario'] = preco_unit
                    
            except:
                continue
    
    return produtos_completos

@app.route('/ping')
def ping():
    return jsonify({"status": "MVP Backend funcionando!", "timestamp": datetime.now().isoformat()})

@app.route('/upload', methods=['POST'])
def upload_csv():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "Nenhum arquivo enviado"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "Nome do arquivo vazio"}), 400
        
        # Salvar arquivo
        filename = file.filename
        filepath = f"uploads/{filename}"
        
        # Criar pasta se não existir
        os.makedirs('uploads', exist_ok=True)
        file.save(filepath)
        
        # Processar CSV
        df = pd.read_csv(filepath, sep=';', encoding='utf-8')
        
        # Converter dados para JSON limpo
        data_dict = df.to_dict('records')
        
        # Armazenar em memória
        uploaded_data[filename] = {
            'data': data_dict,
            'rows': len(df),
            'columns': len(df.columns),
            'column_names': df.columns.tolist(),
            'upload_time': datetime.now().isoformat()
        }
        
        return jsonify({
            "success": True,
            "filename": filename,
            "rows": len(df),
            "columns": len(df.columns),
            "preview": data_dict[:5]  # Primeiras 5 linhas
        })
        
    except Exception as e:
        return jsonify({"error": f"Erro ao processar arquivo: {str(e)}"}), 500

@app.route('/dashboard')
def get_dashboard():
    try:
        if not uploaded_data:
            return jsonify({"error": "Nenhum arquivo carregado"}), 400
        
        # Combinar todos os dados
        todos_dados = []
        for filename, file_data in uploaded_data.items():
            todos_dados.extend(file_data['data'])
        
        # Detectar colunas automaticamente
        col_valor = detectar_coluna_valor(todos_dados)
        col_regiao = detectar_coluna_regiao(todos_dados)
        col_produto = detectar_coluna_produto(todos_dados)
        col_vendedor = detectar_coluna_vendedor(todos_dados)
        col_data = detectar_coluna_data(todos_dados)
        
        # Debug das colunas detectadas
        print(f"DEBUG: col_regiao detectada = {col_regiao}")
        print(f"DEBUG: col_valor detectada = {col_valor}")
        
        # Calcular KPIs básicos (só vendas, não estoque)
        total_vendas = 0
        total_transacoes = 0
        
        if col_valor:
            for linha in todos_dados:
                # Pular dados de estoque
                if 'estoque_atual' in linha or 'estoque_minimo' in linha:
                    continue
                try:
                    valor = float(linha.get(col_valor, 0))
                    if valor > 0:  # Só contar vendas reais
                        total_vendas += valor
                        total_transacoes += 1
                except:
                    continue
        
        ticket_medio = total_vendas / total_transacoes if total_transacoes > 0 else 0
        
        # Calcular métricas usando funções auxiliares  
        # Filtrar apenas dados de vendas (não estoque) para vendas por região
        dados_vendas = [linha for linha in todos_dados if 'estoque_atual' not in linha and 'estoque_minimo' not in linha]
        
        # Garantir que col_regiao seja sempre 'cidade_filial' para dados de vendas
        if dados_vendas and not col_regiao:
            for linha in dados_vendas:
                if 'cidade_filial' in linha:
                    col_regiao = 'cidade_filial'
                    break
        
        vendas_por_regiao = calcular_vendas_por_regiao(dados_vendas, col_regiao, col_valor) if col_regiao and col_valor else {}
        vendas_por_produto, quantidade_por_produto = calcular_vendas_por_produto(todos_dados, col_produto, col_valor) if col_produto and col_valor else ({}, {})
        vendas_por_vendedor = calcular_vendas_por_vendedor(todos_dados, col_vendedor, col_valor) if col_vendedor and col_valor else {}
        canais = calcular_canais(todos_dados, col_valor) if col_valor else {}
        vendas_por_mes = calcular_sazonalidade(todos_dados, col_data, col_valor) if col_data and col_valor else {}
        estoque_info, valor_total_estoque = analisar_estoque(todos_dados, col_produto) if col_produto else ({}, 0)
        
        # Novas análises
        metas_vs_vendas = analisar_metas_vs_vendas(todos_dados, col_valor) if col_valor else {}
        todos_produtos = listar_todos_produtos(todos_dados, col_produto, col_valor) if col_produto and col_valor else {}
        
        # Organizar tops (ordenados do maior para menor) - usar exata mesma ordenação
        produtos_ordenados = sorted(todos_produtos.items(), key=lambda x: x[1]['total_vendas'], reverse=True)
        top_produtos = {k: v for k, v in produtos_ordenados[:5]}
        
        # Produtos ordenados por quantidade vendida (para o gráfico de barras)
        produtos_por_quantidade = sorted(todos_produtos.items(), key=lambda x: x[1]['total_quantidade'], reverse=True)
        top_produtos_quantidade = {k: v for k, v in produtos_por_quantidade[:5]}
        
        todas_regioes = dict(sorted(vendas_por_regiao.items(), key=lambda x: x[1], reverse=True))
        top_vendedores = dict(sorted(vendas_por_vendedor.items(), key=lambda x: x[1], reverse=True)[:5])
        sazonalidade_ordenada = dict(sorted(vendas_por_mes.items(), key=lambda x: x[1], reverse=True))
        
        return jsonify({
            "success": True,
            "kpis": {
                "total_vendas": f"R$ {total_vendas:,.2f}",
                "total_transacoes": total_transacoes,
                "ticket_medio": f"R$ {ticket_medio:,.2f}",
                "valor_estoque": f"R$ {valor_total_estoque:,.2f}",
                "arquivos_carregados": len(uploaded_data),
                "colunas_detectadas": f"{col_valor}, {col_regiao}, {col_produto}"
            },
            "canais": {k: {
                "total": f"R$ {v['total']:,.2f}",
                "transacoes": v['transacoes'],
                "ticket_medio": f"R$ {v['ticket_medio']:,.2f}"
            } for k, v in canais.items()},
            "estoque": {k: {
                "atual": v['atual'],
                "minimo": v['minimo'],
                "preco_varejo": f"R$ {v['preco_varejo']:,.2f}",
                "valor_estoque": f"R$ {v['valor_estoque']:,.2f}",
                "status": v['status'],
                "margem": f"{v['margem']:.1f}%"
            } for k, v in estoque_info.items()},
            "sazonalidade": {k: f"R$ {v:,.2f}" for k, v in sazonalidade_ordenada.items()},
            "vendas_por_regiao": {k: f"R$ {v:,.2f}" for k, v in todas_regioes.items()},
            "top_produtos": {k: f"R$ {v['total_vendas']:,.2f} ({v['total_quantidade']} un)" for k, v in top_produtos.items()},
            "top_produtos_quantidade": [(k, v['total_quantidade']) for k, v in top_produtos_quantidade.items()],
            "top_vendedores": {k: f"R$ {v:,.2f}" for k, v in top_vendedores.items()},
            "metas_vs_vendas": {k: {
                "meta": f"R$ {v['meta']:,.2f}",
                "vendas": f"R$ {v['vendas']:,.2f}",
                "percentual": f"{v['percentual']:.1f}%",
                "status": v['status'],
                "diferenca": f"R$ {v['diferenca']:,.2f}"
            } for k, v in metas_vs_vendas.items()},
            "todos_produtos": [(k, {
                "vendas": f"R$ {v['total_vendas']:,.2f}",
                "quantidade": v['total_quantidade'],
                "preco_unitario": f"R$ {v['preco_unitario']:,.2f}",
                "transacoes": v['transacoes']
            }) for k, v in sorted(todos_produtos.items(), key=lambda x: x[1]['total_vendas'], reverse=True)],
            "dados_raw": {
                "preview": todos_dados[:5],
                "total_registros": len(todos_dados)
            }
        })
        
    except Exception as e:
        return jsonify({"error": f"Erro ao gerar dashboard: {str(e)}"}), 500

@app.route('/status')
def get_status():
    return jsonify({
        "arquivos_carregados": len(uploaded_data),
        "arquivos": list(uploaded_data.keys()),
        "total_registros": sum([data['rows'] for data in uploaded_data.values()])
    })

if __name__ == '__main__':
    print("Iniciando MVP DataHub Backend...")
    print("Servidor rodando em: http://localhost:3001")
    print("Endpoints disponíveis:")
    print("   GET  /ping      - Teste de conectividade")
    print("   POST /upload    - Upload de CSVs")
    print("   GET  /dashboard - Dashboard com KPIs")
    print("   GET  /status    - Status dos arquivos")
    app.run(debug=True, port=3001, host='0.0.0.0')