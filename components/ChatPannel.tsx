
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage, Transaction } from '../types';
import { getAiBudgetAnalysis } from '../services/geminiService';
import SendIcon from './icons/SendIcon';
import UserIcon from './icons/UserIcon';
import BotIcon from './icons/BotIcon';
import XCircleIcon from './icons/XCircleIcon';

interface ChatPanelProps {
  transactions: Transaction[];
  totalIncome: number;
  totalExpenses: number;
  isMobileView?: boolean;
  onClose?: () => void;
}

const Message: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isModel = message.role === 'model';
    return (
        <div className={`flex items-start gap-3 ${isModel ? '' : 'justify-end'}`}>
            {isModel && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center"><BotIcon className="w-5 h-5 text-white" /></div>}
            <div className={`max-w-xs md:max-w-md lg:max-w-sm xl:max-w-md p-3 rounded-2xl ${isModel ? 'bg-gray-700 rounded-tl-none' : 'bg-blue-600 text-white rounded-br-none'}`}>
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
            </div>
            {!isModel && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center"><UserIcon className="w-5 h-5 text-gray-300" /></div>}
        </div>
    );
};

const ChatPanel: React.FC<ChatPanelProps> = ({ transactions, totalIncome, totalExpenses, isMobileView = false, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Olá! Como posso ajudar com seu orçamento hoje?' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userInput,
    };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);
    
    try {
        const aiResponse = await getAiBudgetAnalysis(userInput, transactions, { totalIncome, totalExpenses });
        const modelMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: aiResponse,
        };
        setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
        console.error(error);
        const errorMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: "Desculpe, algo deu errado. Por favor, tente novamente.",
        };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  }, [userInput, isLoading, transactions, totalIncome, totalExpenses]);

  return (
    <div className="bg-gray-800/50 rounded-xl shadow-lg flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
        <h2 className="text-xl font-bold text-white">Assistente IA</h2>
        {isMobileView && (
            <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full">
                <XCircleIcon className="w-6 h-6" />
            </button>
        )}
      </div>

      <div ref={chatContainerRef} className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map(msg => <Message key={msg.id} message={msg} />)}
        {isLoading && (
          <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center"><BotIcon className="w-5 h-5 text-white" /></div>
              <div className="max-w-xs md:max-w-md p-3 rounded-2xl bg-gray-700 rounded-tl-none">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span className="animate-pulse">Pensando...</span>
                  </div>
              </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-700 flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Pergunte sobre seus gastos..."
            className="flex-1 bg-gray-700 border border-gray-600 rounded-full px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition disabled:opacity-50"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-3 flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !userInput.trim()}
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;
