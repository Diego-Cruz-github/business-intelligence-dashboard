import React from 'react';
import { BarChart3, Zap, Shield } from 'lucide-react';

export const Header = () => {
  return (
    <header className="bg-white shadow-soft border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-12">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-3 rounded-2xl shadow-card">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              DataHub <span className="text-gradient">Business Intelligence</span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Transforme seus dados em dashboards profissionais automáticos. 
              <br className="hidden sm:block" />
              <span className="font-semibold text-primary-600">Upload → Processamento → Insights</span> em segundos.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl">
              <div className="bg-primary-100 p-2 rounded-lg">
                <Zap className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Processamento Automático</h3>
                <p className="text-sm text-gray-600">ETL inteligente com detecção de relacionamentos</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
              <div className="bg-green-100 p-2 rounded-lg">
                <BarChart3 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Visualizações Avançadas</h3>
                <p className="text-sm text-gray-600">KPIs, gráficos e análises profissionais</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Enterprise Ready</h3>
                <p className="text-sm text-gray-600">Seguro, responsivo e escalável</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};