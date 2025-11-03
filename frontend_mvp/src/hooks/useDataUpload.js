import { useState, useCallback } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:3001';

export const useDataUpload = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);

  const processingSteps = [
    'Analisando estrutura dos arquivos...',
    'Detectando relacionamentos entre dados...',
    'Calculando métricas e KPIs...',
    'Gerando visualizações automáticas...',
    'Finalizando dashboard...'
  ];

  const uploadFiles = useCallback(async (files) => {
    setLoading(true);
    setError('');
    
    const uploadPromises = files.map(async (file) => {
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await axios.post(`${API_BASE}/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        return {
          name: file.name,
          rows: response.data.rows,
          columns: response.data.columns,
          status: 'success'
        };
      } catch (err) {
        console.error(`Erro ao carregar ${file.name}:`, err);
        return {
          name: file.name,
          status: 'error',
          error: err.response?.data?.error || err.message
        };
      }
    });

    try {
      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(result => result.status === 'success');
      const failedUploads = results.filter(result => result.status === 'error');
      
      if (failedUploads.length > 0) {
        setError(`Erro em ${failedUploads.length} arquivo(s): ${failedUploads.map(f => f.name).join(', ')}`);
      }
      
      setUploadedFiles(prev => [...prev, ...successfulUploads]);
      
      return successfulUploads.length > 0;
    } catch (err) {
      setError('Erro no upload dos arquivos');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateDashboard = useCallback(async () => {
    if (uploadedFiles.length === 0) {
      setError('Nenhum arquivo carregado');
      return;
    }

    setProcessing(true);
    setError('');
    setCurrentStep(0);
    
    try {
      // Simulate processing steps
      for (let i = 0; i < processingSteps.length; i++) {
        setCurrentStep(i);
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
      const response = await axios.get(`${API_BASE}/dashboard`);
      setDashboard(response.data);
    } catch (err) {
      console.error('Erro ao gerar dashboard:', err);
      setError(`Erro ao gerar dashboard: ${err.response?.data?.error || err.message}`);
    } finally {
      setProcessing(false);
      setCurrentStep(0);
    }
  }, [uploadedFiles]);

  const resetData = useCallback(() => {
    setUploadedFiles([]);
    setDashboard(null);
    setError('');
    setLoading(false);
    setProcessing(false);
    setCurrentStep(0);
  }, []);

  const removeFile = useCallback((fileName) => {
    setUploadedFiles(prev => prev.filter(file => file.name !== fileName));
  }, []);

  return {
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
    removeFile,
    hasFiles: uploadedFiles.length > 0,
    canGenerateDashboard: uploadedFiles.length > 0 && !loading && !processing
  };
};