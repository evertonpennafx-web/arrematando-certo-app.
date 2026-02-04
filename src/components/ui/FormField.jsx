
import React from 'react';
import { AlertCircle, Upload } from 'lucide-react';
import { Label } from '@/components/ui/label';

const FormField = ({ 
  label, 
  error, 
  icon: Icon, 
  required = false, 
  type = 'text', 
  multiline = false,
  fileAccept,
  placeholder,
  value,
  onChange,
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="flex items-center gap-2 text-[#d4af37] font-medium">
        {Icon && <Icon className="w-4 h-4 text-[#d4af37]" />}
        {label}
        {required && <span className="text-[#d4af37]">*</span>}
      </Label>
      
      {type === 'file' ? (
        <div className="relative">
          <input
            type="file"
            accept={fileAccept}
            onChange={(e) => onChange(e.target.files[0])}
            className="hidden"
            id={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
          />
          <label
            htmlFor={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
            className={`flex items-center justify-center w-full px-4 py-8 border rounded-lg cursor-pointer transition-colors bg-black ${
              error ? 'border-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.2)]' : 'border-gray-800 hover:border-[#d4af37]'
            }`}
          >
            <div className="text-center">
              <Upload className={`w-8 h-8 mx-auto mb-2 text-[#d4af37]`} />
              <p className="text-sm text-gray-400 group-hover:text-white transition-colors">
                {value 
                  ? value.name 
                  : placeholder || 'Clique para selecionar o arquivo'}
              </p>
            </div>
          </label>
        </div>
      ) : multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={5}
          className={`w-full px-4 py-3 bg-black border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent text-white resize-y transition-all min-h-[120px] placeholder-gray-600 ${
            error 
              ? 'border-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.2)]' 
              : 'border-gray-800'
          }`}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-4 py-3 bg-black border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent text-white transition-all placeholder-gray-600 ${
            error 
              ? 'border-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.2)]' 
              : 'border-gray-800'
          }`}
          placeholder={placeholder}
        />
      )}
      
      {error && (
        <p className="text-sm text-[#d4af37] flex items-center gap-2 animate-in fade-in slide-in-from-top-1 font-medium bg-black/50 p-2 rounded border border-[#d4af37]/30">
          <AlertCircle className="w-4 h-4 text-[#d4af37]" />
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
