import React, { useState } from 'react';
import { UploadCloud, File, X, CheckCircle } from 'lucide-react';
import { fileService } from '../../services/fileService';

export interface FileUploaderProps {
  label?: string;
  accept?: string;
  onUploadSuccess?: (key: string) => void;
  helperText?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  label,
  accept = 'image/*,.pdf,.doc,.docx',
  onUploadSuccess,
  helperText,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successKey, setSuccessKey] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setError(null);
      setUploading(true);

      try {
        const key = await fileService.uploadFile(file);
        setSuccessKey(key);
        if (onUploadSuccess) onUploadSuccess(key);
      } catch (err: any) {
        setError(err.message || 'File upload failed. Unable to reach AWS S3 presigned endpoint.');
      } finally {
        setUploading(false);
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setSuccessKey(null);
    setError(null);
  };

  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}

      {!selectedFile ? (
        <label className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-900/50 transition-colors group">
          <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Click to upload or drag & drop
          </p>
          {helperText && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{helperText}</p>}
          <input type="file" accept={accept} onChange={handleFileChange} className="hidden" />
        </label>
      ) : (
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <File className="w-6 h-6 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <div className="text-xs">
              <p className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-xs">{selectedFile.name}</p>
              <p className="text-slate-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {uploading && <span className="text-xs font-semibold text-indigo-600 animate-pulse">Uploading to S3...</span>}
            {successKey && <CheckCircle className="w-5 h-5 text-emerald-500" />}
            <button onClick={removeFile} className="p-1 text-slate-400 hover:text-rose-500 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</p>}
    </div>
  );
};
