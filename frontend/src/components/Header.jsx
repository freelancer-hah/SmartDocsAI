import React from 'react';
import { FileText, Sparkles, BookOpen, RefreshCw, Sun, Moon } from 'lucide-react';

export const Header = ({
  isHealthy,
  geminiConfigured,
  activeDocument,
  onClearChat,
  messageCount,
  theme = 'light',
  onToggleTheme,
}) => {
  return (
    <header className="header">
      <div className="logo-wrapper">
        <div className="logo-icon">
          <FileText size={22} />
        </div>
        <div className="logo-text">
          <h1>
            SmartDocs <span className="logo-gradient">AI</span>
            <span className="badge-rag">Neural RAG</span>
          </h1>
          <p>Context-Grounded Enterprise Document Intelligence</p>
        </div>
      </div>

      <div className="header-status">
        {/* Topic Badges */}
        <div className="status-pill highlight" title="AI Document Intelligence">
          <Sparkles size={13} className="text-cyan" />
          <span>AI Document Assistant</span>
        </div>

        <div className="status-pill" title="Instant Semantic Search & Context Verification">
          <BookOpen size={13} className="text-indigo" />
          <span>Document Q&A System</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          type="button"
          className="theme-toggle-btn"
          onClick={onToggleTheme}
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? (
            <>
              <Moon size={14} className="theme-icon" />
              <span>Dark</span>
            </>
          ) : (
            <>
              <Sun size={14} className="theme-icon" />
              <span>Light</span>
            </>
          )}
        </button>

        {/* Clear Chat Button */}
        {messageCount > 0 && (
          <button
            type="button"
            className="header-action-btn"
            onClick={onClearChat}
            title="Clear Chat Conversation"
          >
            <RefreshCw size={13} />
            <span>Reset Chat</span>
          </button>
        )}
      </div>
    </header>
  );
};
