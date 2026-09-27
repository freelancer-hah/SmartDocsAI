import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  MessageSquare,
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  FileText,
  CornerDownLeft,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { SourceReference } from './SourceReference';

export const ChatInterface = ({
  messages,
  onSendMessage,
  isLoading,
  activeDocument,
  errorMessage,
  onClearChat,
}) => {
  const [inputQuestion, setInputQuestion] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 1 || isLoading) {
      scrollToBottom();
    }
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputQuestion.trim() || isLoading || !activeDocument) return;
    onSendMessage(inputQuestion.trim());
    setInputQuestion('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleCopyAnswer = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Clean markdown-to-html renderer supporting headings, lists, bold, and code
  const renderFormattedText = (text) => {
    if (!text) return null;

    const paragraphs = text.split('\n\n');

    return (
      <div className="markdown-content">
        {paragraphs.map((p, pIdx) => {
          const trimmed = p.trim();

          // Markdown Headings
          if (trimmed.startsWith('### ')) {
            return (
              <h4
                key={pIdx}
                className="markdown-h4"
                dangerouslySetInnerHTML={{ __html: formatInline(trimmed.replace(/^###\s+/, '')) }}
              />
            );
          }
          if (trimmed.startsWith('## ')) {
            return (
              <h3
                key={pIdx}
                className="markdown-h3"
                dangerouslySetInnerHTML={{ __html: formatInline(trimmed.replace(/^##\s+/, '')) }}
              />
            );
          }

          const lines = p.split('\n');
          const isList = lines.every(
            (line) =>
              line.trim().startsWith('•') ||
              line.trim().startsWith('-') ||
              line.trim().startsWith('*') ||
              /^\d+\.\s/.test(line.trim())
          );

          if (isList) {
            return (
              <ul key={pIdx} className="markdown-list">
                {lines.map((item, iIdx) => {
                  const cleanItem = item.replace(/^[\s•\-\*]+|\d+\.\s*/, '');
                  return (
                    <li
                      key={iIdx}
                      dangerouslySetInnerHTML={{ __html: formatInline(cleanItem) }}
                    />
                  );
                })}
              </ul>
            );
          }

          return (
            <p
              key={pIdx}
              dangerouslySetInnerHTML={{ __html: formatInline(p.replace(/\n/g, '<br />')) }}
            />
          );
        })}
      </div>
    );
  };

  const formatInline = (str) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
  };

  return (
    <div className="glass-panel chat-container">
      {/* Chat Stage Header */}
      <div className="chat-stage-header">
        <div className="chat-stage-title">
          <div className="session-status-dot" />
          <span className="session-title">
            {activeDocument ? activeDocument.fileName : 'Awaiting Document Intake'}
          </span>
          {activeDocument && (
            <span className="grounded-badge">
              <ShieldCheck size={12} />
              <span>Grounded Mode</span>
            </span>
          )}
        </div>

        <div className="chat-header-actions">
          {messages.length > 0 && (
            <button
              type="button"
              className="chat-clear-btn"
              onClick={onClearChat}
              title="Clear message history"
            >
              <Trash2 size={13} />
              <span>Clear Chat</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="alert-banner error" style={{ margin: '0.75rem 1.25rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <div className="empty-hero-icon-wrapper">
              <div className="empty-hero-glow" />
              <div className="empty-hero-icon">
                {activeDocument ? <FileText size={32} /> : <MessageSquare size={32} />}
              </div>
            </div>

            <h2>{activeDocument ? 'Document Ready for Q&A' : 'SmartDocs AI'}</h2>
            <p>
              {activeDocument
                ? `"${activeDocument.fileName}" is processed and ready. Type your questions below to get contextual answers with source citations.`
                : 'Upload any PDF document from the left panel to begin your Q&A session.'}
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.role}`}>
              <div className={`avatar ${msg.role === 'user' ? 'user-avatar' : 'bot-avatar'}`}>
                {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>

              <div className="message-content-wrapper">
                <div className="message-bubble">
                  {msg.role === 'user' ? (
                    <div className="user-message-text">{msg.content}</div>
                  ) : (
                    <>
                      {/* Assistant Response Status Header */}
                      {msg.foundInDocument !== undefined && (
                        <div className="answer-grounding-tag">
                          {msg.foundInDocument ? (
                            <div className="grounding-pill verified">
                              <ShieldCheck size={12} />
                              <span>Verified from Document</span>
                            </div>
                          ) : (
                            <div className="grounding-pill out-of-scope">
                              <ShieldAlert size={12} />
                              <span>Information Absent / Out of Scope</span>
                            </div>
                          )}
                        </div>
                      )}

                      {renderFormattedText(msg.content)}

                      {/* Source Citations */}
                      {msg.sources && msg.sources.length > 0 && (
                        <SourceReference sources={msg.sources} />
                      )}
                    </>
                  )}
                </div>

                {/* Assistant Message Action Toolbar */}
                {msg.role === 'assistant' && (
                  <div className="message-actions-bar">
                    <button
                      type="button"
                      className="msg-action-btn"
                      onClick={() => handleCopyAnswer(msg.content, msg.id)}
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check size={12} className="text-emerald" />
                          <span className="text-emerald">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copy Answer</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="message assistant animate-fade-in">
            <div className="avatar bot-avatar">
              <Sparkles size={18} className="animate-spin-slow" />
            </div>
            <div className="message-content-wrapper">
              <div className="message-bubble loading-bubble">
                <div className="retrieval-status-text">
                  <Zap size={13} className="text-cyan animate-pulse" />
                  <span>Searching vector index & synthesizing response...</span>
                </div>
                <div className="typing-indicator">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <div className="chat-input-wrapper">
        <form className="chat-form" onSubmit={handleSubmit}>
          <div className="input-glow-layer" />
          <input
            type="text"
            className="chat-input"
            placeholder={
              activeDocument
                ? `Ask anything about "${activeDocument.fileName}"...`
                : 'Please upload a PDF document first to ask questions...'
            }
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading || !activeDocument}
          />

          <div className="input-right-tools">
            <span className="enter-hint">
              Enter <CornerDownLeft size={11} />
            </span>
            <button
              type="submit"
              className="send-btn"
              disabled={!inputQuestion.trim() || isLoading || !activeDocument}
              title="Send Question"
            >
              <Send size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
