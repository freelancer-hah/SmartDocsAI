import React, { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen, Quote, Copy, Check, Sparkles, ShieldCheck } from 'lucide-react';

export const SourceReference = ({ sources }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);

  if (!sources || sources.length === 0) return null;

  const handleCopySnippet = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1800);
  };

  return (
    <div className="sources-container">
      <button
        type="button"
        className={`sources-toggle ${isExpanded ? 'open' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="toggle-left">
          <ShieldCheck size={14} className="text-emerald" />
          <span className="sources-count-badge">
            {sources.length} Grounding Source{sources.length > 1 ? 's' : ''} Retrieved
          </span>
        </div>
        <div className="toggle-right">
          <span className="toggle-action-text">{isExpanded ? 'Collapse' : 'Inspect Evidence'}</span>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {isExpanded && (
        <div className="sources-list animate-slide-down">
          {sources.map((src, idx) => {
            const rawScore = parseFloat(src.relevanceScore) || (src.score ? src.score * 100 : 0);
            const isHighMatch = rawScore >= 60;

            return (
              <div key={src.chunkId || idx} className="source-card">
                <div className="source-card-header">
                  <div className="source-title-group">
                    <span className="source-index">#{src.sourceNumber || idx + 1}</span>
                    <span className="source-section-name" title={src.section}>
                      {src.section || 'General Context'}
                    </span>
                  </div>

                  <div className="source-header-actions">
                    <span
                      className={`source-score-pill ${isHighMatch ? 'high-score' : 'med-score'}`}
                      title="Cosine Similarity with Question Embedding"
                    >
                      {src.relevanceScore || `${rawScore.toFixed(1)}%`} Match
                    </span>

                    <button
                      type="button"
                      className="source-copy-btn"
                      onClick={() => handleCopySnippet(src.fullText || src.snippet, idx)}
                      title="Copy context excerpt"
                    >
                      {copiedIdx === idx ? (
                        <>
                          <Check size={12} className="text-emerald" />
                          <span className="text-emerald">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="source-snippet-box">
                  <Quote size={12} className="quote-icon" />
                  <p className="source-text">{src.snippet || src.fullText}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
