/**
 * src/components/common/AIChatModal.jsx — Floating AI Capacity Building Assistant
 */

import { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
} from 'lucide-react';
import { chatWithAIApi } from '../../api/ai.api';

/**
 * Renders text with **bold** markdown tags converted to styled <strong> elements
 * without displaying the raw asterisks to the user.
 */
function formatMessageContent(text, isUser) {
  if (!text) return null;

  const lines = text.split('\n');

  return lines.map((line, lineIdx) => {
    const parts = line.split(/(\*\*.*?\*\*)/g);

    return (
      <span key={lineIdx} className={lineIdx > 0 ? 'block mt-1' : 'block'}>
        {parts.map((part, partIdx) => {
          if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
            const boldText = part.slice(2, -2);
            return (
              <strong
                key={partIdx}
                className={`font-semibold ${isUser ? 'text-white font-bold' : 'text-slate-900'}`}
              >
                {boldText}
              </strong>
            );
          }
          return part;
        })}
      </span>
    );
  });
}

export default function AIChatModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hello! I am your **Capacity Connect AI Assistant**. How can I assist with your skill gaps, course recommendations, or career progression today?',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const userText = textToSend || input;
    if (!userText.trim() || isTyping) return;

    const newMessages = [...messages, { role: 'user', text: userText }];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      const res = await chatWithAIApi(userText);
      setMessages([...newMessages, { role: 'assistant', text: res.reply }]);
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          text: 'Sorry, I encountered an issue retrieving capacity insights. Please try again.',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickPrompts = [
    'Analyze my skill gaps',
    'What courses are recommended for me?',
    'How does competency level scoring work?',
    'Show career progression guidance',
  ];

  return (
    <>
      {/* ── Floating Launcher Button ── */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Toggle AI Capacity Assistant"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold text-xs px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-full shadow-lg shadow-blue-500/25 hover:shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/20"
      >
        <Sparkles className="w-4 h-4 shrink-0 text-amber-200" />
        <span className="hidden xs:inline sm:inline">AI Capacity Assistant</span>
        <span className="xs:hidden sm:hidden">AI</span>
      </button>

      {/* ── Chat Modal Window ── */}
      {isOpen && (
        <div className="fixed bottom-16 sm:bottom-20 right-2 sm:right-6 z-50 w-[calc(100vw-1rem)] sm:w-[400px] max-w-[420px] h-[520px] max-h-[calc(100vh-5.5rem)] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-4 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
                <Bot className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold flex items-center gap-1.5">
                  Capacity AI Assistant
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </h3>
                <p className="text-xs text-slate-300">Contextual Mentorship & Gap Insights</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close assistant"
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
            {/* Subtle Empty State Greeting (Only shown before first user prompt) */}
            {messages.length === 1 && (
              <div className="text-center pt-2 pb-1 px-3 mb-1">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-2">
                  <Bot className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-semibold text-slate-800">
                  How can I help you learn today?
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 max-w-xs mx-auto">
                  Ask about your skill gaps, recommended courses, or career development.
                </p>
              </div>
            )}

            {messages.map((m, idx) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      isUser
                        ? 'bg-blue-600 text-white'
                        : 'bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[85%] shadow-2xs ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-xs'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                    }`}
                  >
                    {formatMessageContent(m.text, isUser)}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-slate-400 pl-8">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs font-medium text-slate-500">Analyzing competency graph...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts (Wrapped, non-clipped presentation) */}
          <div className="px-3 py-2 border-t border-slate-100 bg-white shrink-0">
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(qp)}
                  disabled={isTyping}
                  className="text-xs font-medium bg-slate-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {qp}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-slate-200 bg-white shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about skill gaps, courses, SOPs..."
                disabled={isTyping}
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 text-slate-800 placeholder-slate-400 transition-all disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                title="Send message"
                className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors shadow-2xs shrink-0 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

