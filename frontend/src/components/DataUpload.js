import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';

const DataUpload = ({ onDataUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const onDrop = async (acceptedFiles) => {
    if (!acceptedFiles.length) return;

    setUploading(true);
    setError(null);

    try {
      const uploadPromises = acceptedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('http://localhost:5000/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed for ${file.name}`);
        }

        return await response.json();
      });

      const results = await Promise.all(uploadPromises);
      
      // Se múltiplos arquivos, combinar resultados
      if (results.length === 1) {
        onDataUploaded(results[0]);
      } else {
        // Combinar múltiplos datasets
        onDataUploaded({
          status: 'success',
          data: {
            filename: `${results.length} arquivos combinados`,
            datasets: results.map(r => r.data),
            total_files: results.length,
            upload_time: new Date().toISOString(),
            rows: results.reduce((sum, r) => sum + (r.data?.processed_rows || 0), 0),
            columns: Math.max(...results.map(r => r.data?.columns || 0))
          },
          cache_key: 'multiple_files',
          results: results
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/json': ['.json']
    },
    multiple: true,
  });

  return (
    <div className="max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} disabled={uploading} />
        
        <div className="space-y-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
          </div>
          
          {uploading ? (
            <div>
              <p className="text-lg font-medium text-gray-900">Processando arquivo...</p>
              <div className="w-32 h-2 bg-gray-200 rounded-full mx-auto mt-4">
                <div className="h-2 bg-blue-600 rounded-full animate-pulse w-1/2"></div>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium text-gray-900">
                {isDragActive ? 'Solte o arquivo aqui' : 'Arraste arquivos ou clique para selecionar'}
              </p>
              <p className="text-gray-600">
                Excel (.xlsx, .xls), CSV (.csv) ou JSON (.json)
              </p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">Erro: {error}</p>
        </div>
      )}

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Arquivos de teste disponíveis na pasta test-data/</p>
      </div>
    </div>
  );
};

export default DataUpload;