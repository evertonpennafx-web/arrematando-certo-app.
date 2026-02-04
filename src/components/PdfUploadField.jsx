
import React, { useState, useRef } from 'react';
import { Upload, FileText, X, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PdfUploadField = ({ 
  label = "Upload do arquivo PDF", 
  onFileSelect, 
  error,
  required = false
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [localError, setLocalError] = useState(null);
  const inputRef = useRef(null);

  const MAX_SIZE_MB = 5;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

  const validateFile = (file) => {
    setLocalError(null);
    
    if (file.type !== 'application/pdf') {
      setLocalError('Apenas arquivos PDF são permitidos.');
      return false;
    }
    
    if (file.size > MAX_SIZE_BYTES) {
      setLocalError(`O arquivo excede o tamanho máximo de ${MAX_SIZE_MB}MB.`);
      return false;
    }

    return true;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files[0]);
    }
  };

  const handleFiles = (file) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      onFileSelect(file);
    } else {
      setSelectedFile(null);
      onFileSelect(null);
    }
  };

  const clearFile = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    onFileSelect(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const displayError = error || localError;

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-2">
         <span className="text-sm font-medium text-gray-300">{label}</span>
         {required && <span className="text-red-500">*</span>}
      </div>
      
      <div
        className={`relative flex flex-col items-center justify-center w-full min-h-[140px] border-2 border-dashed rounded-lg transition-all duration-300 ${
          dragActive 
            ? 'border-[#d4af37] bg-[#d4af37]/10' 
            : displayError 
              ? 'border-red-500/50 bg-red-500/5' 
              : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={handleChange}
        />

        <AnimatePresence mode="wait">
          {selectedFile ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-4 p-4 w-full max-w-[90%] bg-gray-900 rounded-lg border border-gray-700 z-20"
            >
              <div className="p-3 bg-red-500/10 rounded-lg">
                <FileText className="w-8 h-8 text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={clearFile}
                className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center p-6"
            >
              <Upload className={`w-10 h-10 mx-auto mb-3 ${dragActive ? 'text-[#d4af37]' : 'text-gray-500'}`} />
              <p className="text-sm text-gray-300 mb-1">
                <span className="font-semibold text-[#d4af37]">Clique para enviar</span> ou arraste o arquivo
              </p>
              <p className="text-xs text-gray-500">PDF (MAX. 5MB)</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {displayError && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mt-2 text-sm text-red-400"
        >
          <AlertCircle className="w-4 h-4" />
          <span>{displayError}</span>
        </motion.div>
      )}
    </div>
  );
};

export default PdfUploadField;
