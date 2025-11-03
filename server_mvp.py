# MVP DataHub - Backend Simples e Funcional
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Storage simples em memória
uploaded_data = {}

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
        col_valor = None
        col_regiao = None
        col_produto = None
        
        # Buscar coluna de valor
        for linha in todos_dados:
            for col in linha.keys():
                col_lower = col.lower()
                if any(palavra in col_lower for palavra in ['valor', 'vendas', 'receita', 'mrr', 'contrato']):
                    try:
                        float(linha[col])
                        col_valor = col
                        break
                    except:
                        continue
            if col_valor:
                break
        
        # Buscar coluna de região
        for linha in todos_dados:
            for col in linha.keys():
                col_lower = col.lower()
                if any(palavra in col_lower for palavra in ['regiao', 'estado', 'cidade']):
                    col_regiao = col
                    break
            if col_regiao:
                break
        
        # Buscar coluna de produto (priorizar nome_produto)
        for linha in todos_dados:
            for col in linha.keys():
                col_lower = col.lower()
                if 'nome_produto' in col_lower:
                    col_produto = col
                    break
                elif any(palavra in col_lower for palavra in ['produto', 'item', 'categoria']):
                    col_produto = col
            if col_produto and 'nome_produto' in col_produto.lower():
                break
        
        # Calcular KPIs básicos
        total_vendas = 0
        total_transacoes = len(todos_dados)
        
        if col_valor:
            for linha in todos_dados:
                try:
                    valor = float(linha.get(col_valor, 0))
                    total_vendas += valor
                except:
                    continue
        
        ticket_medio = total_vendas / total_transacoes if total_transacoes > 0 else 0
        
        # Vendas por região
        vendas_por_regiao = {}
        if col_regiao and col_valor:
            for linha in todos_dados:
                regiao = linha.get(col_regiao, 'Outros')
                try:
                    valor = float(linha.get(col_valor, 0))
                    if regiao not in vendas_por_regiao:
                        vendas_por_regiao[regiao] = 0
                    vendas_por_regiao[regiao] += valor
                except:
                    continue
        
        # Top produtos com quantidade
        vendas_por_produto = {}
        quantidade_por_produto = {}
        if col_produto and col_valor:
            for linha in todos_dados:
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
        
        # Detectar automaticamente vendedores
        vendas_por_vendedor = {}
        for linha in todos_dados:
            vendedor = None
            for col in linha.keys():
                if 'vendedor' in col.lower():
                    vendedor = linha.get(col)
                    break
            if vendedor and col_valor:
                try:
                    valor = float(linha.get(col_valor, 0))
                    if vendedor not in vendas_por_vendedor:
                        vendas_por_vendedor[vendedor] = 0
                    vendas_por_vendedor[vendedor] += valor
                except:
                    continue
        
        # Detectar canais (atacado/varejo) automaticamente
        canais = {}
        for linha in todos_dados:
            canal = None
            if 'vendedor' in linha and linha.get('vendedor'):
                canal = 'Varejo'
            elif 'vendedor_responsavel' in linha and linha.get('vendedor_responsavel'):
                canal = 'Atacado'
            elif 'estoque_atual' in linha or 'meta_mensal' in linha:
                continue  # Skip dados de estoque e filiais
            else:
                canal = 'Outros'
                
            if canal and col_valor:
                if canal not in canais:
                    canais[canal] = {'total': 0, 'transacoes': 0}
                try:
                    valor = float(linha.get(col_valor, 0))
                    if valor > 0:  # Só contar valores válidos
                        canais[canal]['total'] += valor
                        canais[canal]['transacoes'] += 1
                except:
                    continue
        
        # Análise de estoque automatica
        estoque_info = {}
        for linha in todos_dados:
            if 'estoque_atual' in linha:
                nome = linha.get(col_produto, 'Item')
                atual = linha.get('estoque_atual', 0)
                minimo = linha.get('estoque_minimo', 0)
                margem = linha.get('margem_varejo', 0)
                
                estoque_info[nome] = {
                    'atual': atual,
                    'minimo': minimo,
                    'status': 'CRÍTICO' if atual < minimo else 'OK',
                    'margem': margem
                }
        
        # Sazonalidade automática
        vendas_por_mes = {}
        for linha in todos_dados:
            for col in linha.keys():
                if 'data' in col.lower():
                    data = str(linha.get(col, ''))
                    if '/' in data and len(data.split('/')) >= 3:
                        try:
                            mes_ano = f"{data.split('/')[1]}/{data.split('/')[2]}"
                            if mes_ano not in vendas_por_mes:
                                vendas_por_mes[mes_ano] = 0
                            valor = float(linha.get(col_valor, 0))
                            vendas_por_mes[mes_ano] += valor
                        except:
                            continue
                    break
        
        # Organizar tops (ordenados do maior para menor)
        top_produtos = dict(sorted(vendas_por_produto.items(), key=lambda x: x[1], reverse=True)[:5])
        todas_regioes = dict(sorted(vendas_por_regiao.items(), key=lambda x: x[1], reverse=True))  # TODAS as cidades
        top_vendedores = dict(sorted(vendas_por_vendedor.items(), key=lambda x: x[1], reverse=True)[:5])
        
        # Ordenar sazonalidade por valor (maior para menor)
        sazonalidade_ordenada = dict(sorted(vendas_por_mes.items(), key=lambda x: x[1], reverse=True))
        
        # Calcular tickets médios por canal
        for canal in canais:
            if canais[canal]['transacoes'] > 0:
                canais[canal]['ticket_medio'] = canais[canal]['total'] / canais[canal]['transacoes']
            else:
                canais[canal]['ticket_medio'] = 0
        
        return jsonify({
            "success": True,
            "kpis": {
                "total_vendas": f"R$ {total_vendas:,.2f}",
                "total_transacoes": total_transacoes,
                "ticket_medio": f"R$ {ticket_medio:,.2f}",
                "arquivos_carregados": len(uploaded_data),
                "colunas_detectadas": f"{col_valor}, {col_regiao}, {col_produto}"
            },
            "canais": {k: {
                "total": f"R$ {v['total']:,.2f}",
                "transacoes": v['transacoes'],
                "ticket_medio": f"R$ {v['ticket_medio']:,.2f}"
            } for k, v in canais.items()},
            "estoque": estoque_info,
            "sazonalidade": {k: f"R$ {v:,.2f}" for k, v in sazonalidade_ordenada.items()},
            "vendas_por_regiao": {k: f"R$ {v:,.2f}" for k, v in todas_regioes.items()},
            "top_produtos": {k: f"R$ {v:,.2f} ({quantidade_por_produto.get(k, 0)} un)" for k, v in top_produtos.items()},
            "top_vendedores": {k: f"R$ {v:,.2f}" for k, v in top_vendedores.items()},
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