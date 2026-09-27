import React from 'react';
import { FileText, Trash2, CheckCircle2, Layers, BookOpen, Hash, HardDrive } from 'lucide-react';

export const DocumentStatsBar = ({ document, onClear }) => {
  if (!document) return null;

  return (
    <div className="glass-panel doc-card">
      <div className="doc-header">
        <div className="doc-title-row">
          <div className="doc-badge-icon">
            <FileText size={18} />
          </div>
          <div className="doc-info-text">
            <span className="doc-name" title={document.fileName}>
              {document.fileName}
            </span>
            <div className="doc-status-line">
              <span className="active-dot" />
              <span className="status-text">Vector Store Active</span>
              {document.fileSizeFormatted && (
                <span className="file-size-tag">• {document.fileSizeFormatted}</span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClear}
          className="doc-clear-btn"
          title="Unload document and clear index"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div className="doc-stats-grid">
        <div className="stat-item">
          <div className="stat-icon-label">
            <BookOpen size={12} className="text-cyan" />
            <span className="stat-label">Pages</span>
          </div>
          <div className="stat-value">{document.numPages || 1}</div>
        </div>

        <div className="stat-item highlight">
          <div className="stat-icon-label">
            <Layers size={12} className="text-indigo" />
            <span className="stat-label">Chunks</span>
          </div>
          <div className="stat-value text-gradient">{document.chunkCount || 0}</div>
        </div>

        <div className="stat-item">
          <div className="stat-icon-label">
            <Hash size={12} className="text-emerald" />
            <span className="stat-label">Words</span>
          </div>
          <div className="stat-value">{document.wordCount ? document.wordCount.toLocaleString() : 0}</div>
        </div>
      </div>
    </div>
  );
};
