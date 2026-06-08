import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { getSocket, initSocket, disconnectSocket } from '../services/socket';
import Card from '../components/Card';
import Button from '../components/Button';
import { Bot, Send, Trash2, AlertCircle, Sparkles, User } from 'lucide-react';

const parseInlineStyles = (text) => {
  if (!text) return '';
  const inlineRegex = /(\*\*.*?\*\*|`.*?`)/g;
  const parts = text.split(inlineRegex);
  return parts.map((part, partIdx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={partIdx} className="font-semibold text-gray-900 dark:text-white">{part.slice(2, -2)}</strong>;
    } else if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={partIdx} className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700/60 rounded font-mono text-xs text-red-500 dark:text-red-400">{part.slice(1, -1)}</code>;
    }
    return part;
  });
};

const renderFormattedText = (text) => {
  if (!text) return null;
  const lines = text.split('\n');
  const renderedElements = [];
  let inCodeBlock = false;
  let codeLines = [];
  let codeLanguage = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        renderedElements.push(
          <pre key={`code-${i}`} className="p-3 bg-gray-950 text-gray-100 rounded-xl font-mono text-[11px] overflow-x-auto my-2 border border-gray-800 text-left">
            {codeLanguage && (
              <span className="block text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-1 select-none">
                {codeLanguage}
              </span>
            )}
            <code>{codeLines.join('\n')}</code>
          </pre>
        );
        codeLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeLanguage = line.trim().substring(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    // Headers
    const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const content = parseInlineStyles(headerMatch[2]);
      const Tag = `h${Math.min(6, level + 1)}`;
      const classes = level === 1 
        ? "text-base font-bold my-2 text-gray-900 dark:text-white" 
        : level === 2 
        ? "text-sm font-bold my-1.5 text-gray-800 dark:text-gray-100" 
        : "text-xs font-semibold my-1 text-gray-700 dark:text-gray-200";
      renderedElements.push(<Tag key={i} className={classes}>{content}</Tag>);
      continue;
    }

    // List items
    const listMatch = line.match(/^(\*|-|\d+\.)\s+(.*)$/);
    if (listMatch) {
      const content = parseInlineStyles(listMatch[2]);
      renderedElements.push(
        <div key={i} className="flex items-start space-x-2 my-1 ml-3 text-xs leading-relaxed text-left">
          <span className="text-primary-500 font-bold select-none mt-0.5">•</span>
          <span className="flex-1 text-gray-700 dark:text-gray-300">{content}</span>
        </div>
      );
      continue;
    }

    // Paragraph
    const content = parseInlineStyles(line);
    renderedElements.push(
      <p key={i} className={line.trim() === '' ? 'h-2' : 'my-1 text-gray-700 dark:text-gray-300 text-left'}>
        {content}
      </p>
    );
  }

  if (inCodeBlock && codeLines.length > 0) {
    renderedElements.push(
      <pre key="code-unclosed" className="p-3 bg-gray-950 text-gray-100 rounded-xl font-mono text-[11px] overflow-x-auto my-2 border border-gray-800 text-left">
        <code>{codeLines.join('\n')}</code>
      </pre>
    );
  }

  return <div className="space-y-1">{renderedElements}</div>;
};

const CareerChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // 1. Load History and Establish Socket Connection
  useEffect(() => {
    // A. Fetch Chat History
    const fetchHistory = async () => {
      try {
        const res = await api.get('/chatbot/history');
        // Map database schema {message, response, createdAt} to message array
        const formatted = [];
        res.data.data.forEach((h) => {
          formatted.push({ id: `user-${h.id}`, sender: 'user', text: h.message, date: h.createdAt });
          formatted.push({ id: `ai-${h.id}`, sender: 'ai', text: h.response, date: h.createdAt });
        });
        setMessages(formatted);
      } catch (err) {
        console.error('Failed to load chat history:', err.message);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();

    // B. Initialize Sockets
    const socket = initSocket();
    if (socket) {
      socketRef.current = socket;
      socket.connect();

      // Socket Listeners
      socket.on('receive_message', (data) => {
        setMessages((prev) => [
          ...prev,
          { id: `user-new-${data.id}`, sender: 'user', text: data.message, date: data.createdAt },
          { id: `ai-new-${data.id}`, sender: 'ai', text: data.response, date: data.createdAt },
        ]);
        setTyping(false);
      });

      socket.on('typing', (data) => {
        setTyping(data.typing);
      });

      socket.on('chat_error', (data) => {
        setError(data.message);
        setTyping(false);
      });

      socket.on('connect_error', (err) => {
        setError('Failed to connect to real-time chat server.');
        setTyping(false);
      });
    }

    return () => {
      disconnectSocket();
    };
  }, []);

  // 2. Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !socketRef.current) return;

    setError(null);
    
    // Emit message to Socket server
    socketRef.current.emit('send_message', { message: inputMessage });
    setInputMessage('');
    setTyping(true);
  };

  const handleClearHistory = async () => {
    try {
      await api.delete('/chatbot/history');
      setMessages([]);
      setShowConfirmModal(false);
    } catch (err) {
      setError('Failed to delete chat history.');
      setShowConfirmModal(false);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-4 text-left">
      <div className="flex justify-between items-center flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold font-sans flex items-center space-x-2">
            <Bot className="h-6 w-6 text-primary-500" />
            <span>AI Career Chatbot</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Ask career advice, interview questions, or optimization tips.
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setShowConfirmModal(true)}
            className="flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear Logs</span>
          </button>
        )}
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-darkCard p-0 border border-gray-200/50 dark:border-gray-800/50 rounded-3xl">
        {/* Chat Messages Log */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
          {loadingHistory ? (
            <div className="h-full flex items-center justify-center text-gray-400">
              <p className="text-sm animate-pulse">Syncing chat history...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-4">
              <div className="h-16 w-16 bg-primary-500/10 text-primary-500 rounded-full flex items-center justify-center">
                <Sparkles className="h-8 w-8" />
              </div>
              <div>
                <h4 className="font-bold text-gray-600 dark:text-gray-400">Start Your Conversation</h4>
                <p className="text-xs max-w-sm mt-1">
                  Ask questions like "Explain closures in JS" or "How to improve my React resume score".
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div
                  className={`flex items-start space-x-2.5 max-w-[80%] ${
                    msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                  }`}
                >
                  {/* Icon Avatar */}
                  <div
                    className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white ${
                      msg.sender === 'user' ? 'bg-primary-500' : 'bg-indigo-500'
                    }`}
                  >
                    {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>

                  {/* Bubble content */}
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed font-light ${
                      msg.sender === 'user'
                        ? 'bg-primary-500 text-white rounded-tr-none'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none'
                    }`}
                  >
                    {msg.sender === 'user' ? (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      renderFormattedText(msg.text)
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Typing Indicator */}
          {typing && (
            <div className="flex justify-start animate-fade-in">
              <div className="flex items-start space-x-2.5">
                <div className="h-8 w-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-none flex items-center space-x-1.5">
                  <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input box bottom */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-darkCard/50">
          {error && (
            <div className="mb-3 p-3 text-xs bg-red-50 dark:bg-red-950/20 text-red-500 rounded-xl flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex space-x-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask anything about coding, jobs, or interviews..."
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
            <Button type="submit" disabled={!inputMessage.trim() || typing}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>

      {/* Custom Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-darkCard rounded-3xl border border-gray-200/50 dark:border-gray-800/50 p-6 max-w-sm w-full shadow-2xl animate-scale-in text-center space-y-4">
            <div className="mx-auto h-12 w-12 bg-red-100 dark:bg-red-950/30 text-red-500 rounded-full flex items-center justify-center">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Clear Chat Logs?</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                This will permanently delete all your conversation history with the Career Copilot. This action cannot be undone.
              </p>
            </div>
            <div className="flex space-x-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1 rounded-xl"
                onClick={handleClearHistory}
              >
                Yes, Clear
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerChatbot;
