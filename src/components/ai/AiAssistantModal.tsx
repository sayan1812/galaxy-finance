import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, AlertTriangle, Check, RotateCcw, Sparkles, User, RefreshCw } from 'lucide-react';
import api from '../../services/apiClient';
import type { AiChatMessage } from '../../types';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged?: () => void;
  onTriggerMicroReaction?: (type: any, title: string, message?: string) => void;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  onDataChanged,
  onTriggerMicroReaction
}) => {
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'assistant',
      text: "🌌 **Welcome to your RupeeWise AI Financial Agent!**\n\nI can analyze your spending, categorize transactions, propose budgets, and search your vaults. For safety, destructive operations always require your explicit confirmation.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmingActionId, setConfirmingActionId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = inputText.trim();
    if (!query || loading) return;

    const userMsg: AiChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await api.chatWithAi(query);
      const aiMsg: AiChatMessage = {
        id: 'ai_' + Date.now(),
        sender: 'assistant',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        requiresConfirmation: res.requiresConfirmation,
        pendingAction: res.pendingAction
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'assistant',
          text: `⚠️ Error processing request: ${err.message || 'Please check your connection.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAction = async (actionId: string, confirmed: boolean) => {
    setConfirmingActionId(actionId);
    try {
      const res = await api.confirmAiAction(actionId, confirmed);
      
      setMessages(prev => [
        ...prev,
        {
          id: 'res_' + Date.now(),
          sender: 'assistant',
          text: confirmed 
            ? `✅ **Action Confirmed**: ${res.message}` 
            : `❌ **Action Cancelled**: Operation was not executed.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

      if (confirmed && onDataChanged) {
        onDataChanged();
        if (onTriggerMicroReaction) {
          onTriggerMicroReaction('TRANSACTION_DELETED', 'Transaction Deleted by AI', res.message);
        }
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'assistant',
          text: `Failed to confirm action: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setConfirmingActionId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg h-[620px] rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl flex flex-col overflow-hidden text-slate-100 animate-micro-pop">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Cosmic AI Assistant
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Tool-Secured
                </span>
              </h3>
              <p className="text-xs text-slate-400">Strict User Isolation & Permission Guard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-cyan-600 text-slate-950 font-medium ml-4'
                    : 'bg-slate-800/80 border border-slate-700/80 text-slate-200'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>

                {/* Staged Confirmation Card for Destructive Actions */}
                {msg.requiresConfirmation && msg.pendingAction && (
                  <div className="mt-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/40 text-slate-200 space-y-3">
                    <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Destructive Action Confirmation Required</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      {msg.pendingAction.description}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleConfirmAction(msg.pendingAction!.id, true)}
                        disabled={confirmingActionId === msg.pendingAction.id}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                      >
                        {confirmingActionId === msg.pendingAction.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        <span>Confirm & Delete</span>
                      </button>
                      <button
                        onClick={() => handleConfirmAction(msg.pendingAction!.id, false)}
                        disabled={confirmingActionId === msg.pendingAction.id}
                        className="py-1.5 px-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-1.5 text-[10px] text-slate-400 text-right">
                  {msg.timestamp}
                </div>
              </div>
              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-slate-700 text-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-cyan-400 pl-11">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Analyzing financial models & vaults...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-900/90 flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask AI: 'Summarize my spending', 'Delete transaction of ₹350'..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-cyan-500 transition"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm flex items-center justify-center transition disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiAssistantModal;
