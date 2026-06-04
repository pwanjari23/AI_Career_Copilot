import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { getSocket, initSocket, disconnectSocket } from '../services/socket';
import Card from '../components/Card';
import Button from '../components/Button';
import { Bot, Send, Trash2, AlertCircle, Sparkles, User } from 'lucide-react';

const CareerChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
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
    if (!window.confirm('Are you sure you want to clear your conversation history?')) return;
    
    try {
      await api.delete('/chatbot/history');
      setMessages([]);
    } catch (err) {
      setError('Failed to delete chat history.');
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
            onClick={handleClearHistory}
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
                    <p className="whitespace-pre-wrap">{msg.text}</p>
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
    </div>
  );
};

export default CareerChatbot;
