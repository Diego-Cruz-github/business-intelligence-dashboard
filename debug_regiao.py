import pandas as pd
import json

# Ler dados de vendas
try:
    varejo = pd.read_csv('uploads/vendas-varejo.csv', sep=';')
    atacado = pd.read_csv('uploads/vendas-atacado.csv', sep=';')
    
    print("COLUNAS VAREJO:", list(varejo.columns))
    print("COLUNAS ATACADO:", list(atacado.columns))
    
    print("\nPRIMEIRA LINHA VAREJO:")
    print(varejo.iloc[0].to_dict())
    
    print("\nPRIMEIRA LINHA ATACADO:")
    print(atacado.iloc[0].to_dict())
    
    # Verificar cidades específicas
    if 'cidade_filial' in varejo.columns:
        print("\nCIDADES VAREJO:", varejo['cidade_filial'].unique())
    if 'cidade_filial' in atacado.columns:
        print("CIDADES ATACADO:", atacado['cidade_filial'].unique())
        
    # Testar soma por cidade
    print("\nTESTE SOMA VAREJO por cidade_filial:")
    if 'cidade_filial' in varejo.columns and 'valor_total' in varejo.columns:
        soma_varejo = varejo.groupby('cidade_filial')['valor_total'].sum()
        print(soma_varejo)
        
    print("\nTESTE SOMA ATACADO por cidade_filial:")
    if 'cidade_filial' in atacado.columns and 'valor_total' in atacado.columns:
        soma_atacado = atacado.groupby('cidade_filial')['valor_total'].sum()
        print(soma_atacado)

except Exception as e:
    print(f"ERRO: {e}")