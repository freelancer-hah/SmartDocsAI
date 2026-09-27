import React from 'react';
import { ShieldCheck, Zap, Search, FileCheck2, Cpu } from 'lucide-react';

export const FeaturesCard = () => {
  const features = [
    {
      icon: <Zap size={14} className="text-cyan" />,
      title: 'Dense Vector Search',
      desc: 'Top-K semantic similarity matching across embedded document segments.',
    },
    {
      icon: <ShieldCheck size={14} className="text-emerald" />,
      title: 'Anti-Hallucination Guard',
      desc: 'Strict factual synthesis — refuses to speculate if context is missing.',
    },
    {
      icon: <FileCheck2 size={14} className="text-indigo" />,
      title: 'Source Attribution',
      desc: 'Real-time citation badges linking answers directly to source pages.',
    },
    {
      icon: <Cpu size={14} className="text-violet" />,
      title: 'In-Memory Pipeline',
      desc: 'Fast, secure volatile buffer processing with zero persistent data leakage.',
    },
  ];

  return (
    <div className="glass-panel features-overview-panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <Search size={16} className="text-cyan" />
          <h2>Engine Capabilities</h2>
        </div>
        <span className="panel-sub-tag">Enterprise RAG</span>
      </div>

      <div className="features-list">
        {features.map((feat, idx) => (
          <div key={idx} className="feature-item">
            <div className="feature-icon-box">{feat.icon}</div>
            <div className="feature-details">
              <span className="feature-title">{feat.title}</span>
              <p className="feature-desc">{feat.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
