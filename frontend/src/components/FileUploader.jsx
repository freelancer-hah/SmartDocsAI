import React, { useState, useRef } from 'react';
import { UploadCloud, FileCheck, BookOpen, Loader2, Sparkles, AlertCircle, FileType } from 'lucide-react';

export const FileUploader = ({ onUploadSuccess, onLoadSample, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const validateAndProcessFile = (file) => {
    setErrorMsg('');
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Unsupported file format. Please upload a valid PDF document (.pdf).');
      return;
    }

    const maxSizeBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSizeBytes) {
      setErrorMsg('File exceeds the 10MB limit. Please upload a smaller PDF.');
      return;
    }

    onUploadSuccess(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  return (
    <div className="glass-panel uploader-panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <FileType size={16} className="text-cyan" />
          <h2>Document Intake</h2>
        </div>
        <span className="panel-sub-tag">Universal RAG</span>
      </div>

      <div
        className={`upload-zone ${isDragging ? 'dragging' : ''} ${isProcessing ? 'processing' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept=".pdf,application/pdf"
          style={{ display: 'none' }}
          disabled={isProcessing}
        />

        <div className="upload-icon-wrapper">
          <div className="upload-icon-pulse" />
          <div className="upload-icon">
            {isProcessing ? (
              <Loader2 size={24} className="animate-spin text-cyan" />
            ) : (
              <UploadCloud size={24} />
            )}
          </div>
        </div>

        <h3>{isProcessing ? 'Vectorizing Document...' : 'Drop Any PDF Document Here'}</h3>
        <p>
          {isProcessing
            ? 'Extracting text chunks & computing Gemini embeddings...'
            : 'Click to browse or drag & drop (CV, Policy, Report)'}
        </p>

        {isProcessing ? (
          <div className="vectorize-progress-bar">
            <div className="vectorize-progress-shimmer" />
          </div>
        ) : (
          <div className="upload-badge-row">
            <span className="file-format-badge">.PDF up to 10MB</span>
            <span className="file-format-badge">Text Extractable</span>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="alert-banner error" style={{ marginTop: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={15} />
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      {/* Quick Demo Sample Action */}
      <div className="sample-divider">
        <span>OR TRY INSTANT DEMO</span>
      </div>

      <button
        type="button"
        className="sample-doc-btn"
        onClick={onLoadSample}
        disabled={isProcessing}
        title="Load pre-built fictional company policy handbook (Working hours, PTO, Sick leave, Remote work, Expenses, Equipment)"
      >
        <div className="sample-btn-content">
          <div className="sample-icon-box">
            <BookOpen size={16} />
          </div>
          <div className="sample-text-group">
            <span className="sample-title">Acme Global Policy 2026</span>
            <span className="sample-desc">Pre-configured corporate handbook</span>
          </div>
        </div>
        <div className="sample-badge">
          <Sparkles size={12} />
          <span>Demo</span>
        </div>
      </button>
    </div>
  );
};
