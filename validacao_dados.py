#!/usr/bin/env python3
# Validação matemática dos dados do dashboard
import json
import requests

# Obter dados do backend
response = requests.get('http://localhost:3001/dashboard')
data = response.json()

print("=== VALIDAÇÃO COMPLETA DOS DADOS ===\n")

# Função para converter valores brasileiros para float
def convert_brl_to_float(value):
    return float(value.replace('R$', '').replace(' ', '').replace(',', ''))

# 1. VENDAS POR REGIÃO
print("1. VENDAS POR REGIÃO:")
vendas_regiao = data['vendas_por_regiao']
total_regioes = sum(convert_brl_to_float(v) for k, v in vendas_regiao.items() if k != 'Outros')
print(f"   Total calculado: R$ {total_regioes:,.2f}")
print(f"   Total KPI: {data['kpis']['total_vendas']}")
print(f"   ✅ Confere: {abs(total_regioes - convert_brl_to_float(data['kpis']['total_vendas'])) < 1}")

# 2. TOP VENDEDORES
print("\n2. TOP VENDEDORES:")
vendedores = data['top_vendedores']
total_vendedores = sum(convert_brl_to_float(v) for v in vendedores.values())
print(f"   Total vendedores: R$ {total_vendedores:,.2f}")
ordenados = sorted(vendedores.items(), key=lambda x: convert_brl_to_float(x[1]), reverse=True)
print(f"   Ordem correta: {[v[0] for v in ordenados]}")
print(f"   Melhor vendedor: {ordenados[0][0]} - {ordenados[0][1]}")

# 3. CANAIS (ATACADO VS VAREJO)
print("\n3. CANAIS:")
canais = data['canais']
total_canais = sum(convert_brl_to_float(c['total']) for c in canais.values())
print(f"   Atacado: {canais['Atacado']['total']}")
print(f"   Varejo: {canais['Varejo']['total']}")
print(f"   Total canais: R$ {total_canais:,.2f}")
print(f"   ✅ Confere com total: {abs(total_canais - convert_brl_to_float(data['kpis']['total_vendas'])) < 1}")

# 4. SAZONALIDADE
print("\n4. SAZONALIDADE:")
sazonalidade = data['sazonalidade']
total_sazonalidade = sum(convert_brl_to_float(v) for v in sazonalidade.values())
print(f"   Total sazonalidade: R$ {total_sazonalidade:,.2f}")
print(f"   ✅ Confere com total: {abs(total_sazonalidade - convert_brl_to_float(data['kpis']['total_vendas'])) < 1}")

# 5. TOP PRODUTOS
print("\n5. TOP PRODUTOS:")
produtos = data['top_produtos']
total_produtos = sum(convert_brl_to_float(v.split(' (')[0]) for v in produtos.values())
print(f"   Total produtos: R$ {total_produtos:,.2f}")
print("   Ordem por quantidade:")
for produto, info in produtos.items():
    valor = info.split(' (')[0]
    qtd = info.split('(')[1].split(' ')[0]
    print(f"   - {produto}: {qtd} unidades - {valor}")

# 6. KPIs BÁSICOS
print("\n6. KPIs BÁSICOS:")
print(f"   Total vendas: {data['kpis']['total_vendas']}")
print(f"   Transações: {data['kpis']['total_transacoes']}")
print(f"   Ticket médio: {data['kpis']['ticket_medio']}")
ticket_calculado = convert_brl_to_float(data['kpis']['total_vendas']) / data['kpis']['total_transacoes']
print(f"   Ticket calculado: R$ {ticket_calculado:,.2f}")
print(f"   ✅ Confere: {abs(ticket_calculado - convert_brl_to_float(data['kpis']['ticket_medio'])) < 1}")

print("\n=== VALIDAÇÃO CONCLUÍDA ===")