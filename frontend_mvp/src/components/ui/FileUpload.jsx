import React, { useState, useRef, useCallback } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './Button';

export const FileUpload = ({ 
  onFilesSelect, 
  accept = '.csv,.xlsx,.xls', 
  multiple = true,
  maxFiles = 50,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  className = '',
  disabled = false
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    const errors = [];
    
    // Check file size
    if (file.size > maxFileSize) {
      errors.push(`Arquivo "${file.name}" é muito grande (máximo ${Math.round(maxFileSize / 1024 / 1024)}MB)`);
    }
    
    // Check file type
    const allowedTypes = accept.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      errors.push(`Tipo de arquivo "${fileExtension}" não é permitido`);
    }
    
    return errors;
  };

  const handleFiles = useCallback((files) => {
    const fileArray = Array.from(files);
    const newErrors = [];
    const validFiles = [];

    // Check max files limit
    if (uploadedFiles.length + fileArray.length > maxFiles) {
      newErrors.push(`Máximo de ${maxFiles} arquivos permitidos`);
      setErrors(newErrors);
      return;
    }

    fileArray.forEach(file => {
      const fileErrors = validateFile(file);
      if (fileErrors.length === 0) {
        validFiles.push({
          file,
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          status: 'pending'
        });
      } else {
        newErrors.push(...fileErrors);
      }
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
    } else {
      setErrors([]);
    }

    if (validFiles.length > 0) {
      const updatedFiles = [...uploadedFiles, ...validFiles];
      setUploadedFiles(updatedFiles);
      onFilesSelect(validFiles.map(f => f.file));
    }
  }, [uploadedFiles, maxFiles, maxFileSize, accept, onFilesSelect]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (disabled) return;
    
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (fileId) => {
    const updatedFiles = uploadedFiles.filter(f => f.id !== fileId);
    setUploadedFiles(updatedFiles);
  };

  const clearAll = () => {
    setUploadedFiles([]);
    setErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const updateFileStatus = (fileId, status) => {
    setUploadedFiles(prev => 
      prev.map(file => 
        file.id === fileId ? { ...file, status } : file
      )
    );
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300
          ${dragActive 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleChange}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="space-y-4">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
            dragActive ? 'bg-primary-100' : 'bg-gray-100'
          }`}>
            <Upload className={`w-8 h-8 ${
              dragActive ? 'text-primary-600' : 'text-gray-400'
            }`} />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {dragActive ? 'Solte os arquivos aqui' : 'Upload de Dados'}
            </h3>
            <p className="text-gray-600 mb-4">
              Arraste e solte seus arquivos ou <span className="text-primary-600 font-medium">clique para selecionar</span>
            </p>
            <p className="text-sm text-gray-500">
              Suporta: CSV, Excel (XLSX, XLS) • Até {Math.round(maxFileSize / 1024 / 1024)}MB cada
            </p>
          </div>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-red-800 mb-1">
                Erro no upload
              </h4>
              <ul className="text-sm text-red-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-900">
              Arquivos Carregados ({uploadedFiles.length})
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-gray-500 hover:text-red-600"
            >
              Limpar todos
            </Button>
          </div>
          
          <div className="space-y-3">
            {uploadedFiles.map((fileData) => (
              <div 
                key={fileData.id}
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    fileData.status === 'success' ? 'bg-green-100' :
                    fileData.status === 'error' ? 'bg-red-100' :
                    'bg-gray-100'
                  }`}>
                    {fileData.status === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : fileData.status === 'error' ? (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    ) : (
                      <File className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-900">{fileData.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(fileData.size)}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => removeFile(fileData.id)}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors group"
                >
                  <X className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};