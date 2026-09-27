import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { FileUploader } from './components/FileUploader';
import { DocumentStatsBar } from './components/DocumentStatsBar';
import { FeaturesCard } from './components/FeaturesCard';
import { ChatInterface } from './components/ChatInterface';
import { api } from './services/api';

export function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('smartdocs_theme') || 'light');
  const [isHealthy, setIsHealthy] = useState(false);
  const [geminiConfigured, setGeminiConfigured] = useState(false);
  const [activeDocument, setActiveDocument] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Manage theme state attribute on HTML element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('smartdocs_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Initial load: check health & fetch sample questions
  useEffect(() => {
    const initApp = async () => {
      try {
        const health = await api.checkHealth();
        if (health.status === 'healthy') {
          setIsHealthy(true);
          setGeminiConfigured(health.geminiConfigured);
        }

        const active = await api.getActiveDocument();
        if (active.success && active.document) {
          setActiveDocument(active.document);
        }
      } catch (err) {
        console.error('App initialization error:', err);
      }
    };

    initApp();
  }, []);

  // Handle PDF upload
  const handleUploadSuccess = async (file) => {
    setIsUploading(true);
    setErrorMessage('');

    try {
      const result = await api.uploadPdf(file);
      if (result.success) {
        setActiveDocument(result.document);
        setMessages([
          {
            id: `sys_${Date.now()}`,
            role: 'assistant',
            content: `📄 **${result.document.fileName}** has been processed and indexed into the vector store (${result.document.chunkCount} vector chunks, ${result.document.wordCount ? result.document.wordCount.toLocaleString() : 0} words).\n\nYou can now ask any question about this document in the chat below!`,
          },
        ]);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to upload and vectorize PDF.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Loading Sample Policy
  const handleLoadSample = async () => {
    setIsUploading(true);
    setErrorMessage('');

    try {
      const result = await api.loadSamplePolicy();
      if (result.success) {
        setActiveDocument(result.document);
        setMessages([
          {
            id: `sys_${Date.now()}`,
            role: 'assistant',
            content: `📄 **${result.document.fileName}** has been loaded and indexed into the vector store (${result.document.chunkCount} vector chunks, ${result.document.wordCount ? result.document.wordCount.toLocaleString() : 0} words).\n\nYou can now ask any question about this document in the chat below!`,
          },
        ]);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load sample policy.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Clearing Document
  const handleClearDocument = async () => {
    try {
      await api.clearDocument();
      setActiveDocument(null);
      setMessages([]);
      setErrorMessage('');
    } catch (err) {
      console.error('Failed to clear document:', err);
    }
  };

  // Handle Sending a Question
  const handleSendMessage = async (questionText) => {
    if (!questionText.trim()) return;

    const userMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: questionText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsChatLoading(true);
    setErrorMessage('');

    try {
      const response = await api.askQuestion(questionText, activeDocument?.id);

      if (response.success && response.data) {
        const botMessage = {
          id: `bot_${Date.now()}`,
          role: 'assistant',
          content: response.data.answer,
          sources: response.data.sources || [],
          foundInDocument: response.data.foundInDocument,
        };

        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to retrieve answer. Please verify your Gemini API key.');
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: `⚠️ **Error**: ${err.message || 'Could not generate answer.'}\n\nPlease verify that your \`GEMINI_API_KEY\` is configured in \`backend/.env\`.`,
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Handle Clearing Chat history only (keeps document indexed)
  const handleClearChat = () => {
    setMessages([]);
    setErrorMessage('');
  };

  return (
    <div className="app-container">
      <Header
        isHealthy={isHealthy}
        geminiConfigured={geminiConfigured}
        activeDocument={activeDocument}
        onClearChat={handleClearChat}
        messageCount={messages.length}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <main className="main-layout">
        {/* Left Sidebar */}
        <aside className="sidebar">
          <FileUploader
            onUploadSuccess={handleUploadSuccess}
            onLoadSample={handleLoadSample}
            isProcessing={isUploading}
          />

          <DocumentStatsBar
            document={activeDocument}
            onClear={handleClearDocument}
          />

          <FeaturesCard />
        </aside>

        {/* Right Main Chat Interface */}
        <section className="chat-section">
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isChatLoading}
            activeDocument={activeDocument}
            errorMessage={errorMessage}
            onClearChat={handleClearChat}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
