

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Transaction, Category, TransactionType } from '../types';
import { structureCategoriesForSelect } from '../utils/categoryUtils';
import { suggestCategory } from '../services/geminiService';
import SparklesIcon from './icons/SparklesIcon';

interface EditTransactionModalProps {
  transaction: Transaction;
  onUpdateTransaction: (transaction: Transaction) => void;
  onClose: () => void;
  categories: Category[];
}

const EditTransactionModal: React.FC<EditTransactionModalProps> = ({ transaction, onUpdateTransaction, onClose, categories }) => {
  const [description, setDescription] = useState(transaction.description);
  const [amount, setAmount] = useState(transaction.amount.toString());
  const [type, setType] = useState<TransactionType>(transaction.type);
  const [category, setCategory] = useState<Category>(transaction.category);
  const [date, setDate] = useState(transaction.date);
  const [isRecurring, setIsRecurring] = useState(!!transaction.recurring);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const { topLevel, grouped } = useMemo(() => structureCategoriesForSelect(categories), [categories]);

  useEffect(() => {
    setDescription(transaction.description);
    setAmount(transaction.amount.toString());
    setType(transaction.type);
    setCategory(transaction.category);
    setDate(transaction.date);
    setIsRecurring(!!transaction.recurring);
  }, [transaction]);
  
  const getRelativeDate = (offset: number): string => {
    const d = new Date();
    d.setDate(d.getDate() - offset);
    return d.toISOString().split('T')[0];
  }

  const handleSuggestCategory = useCallback(async () => {
    if (!description.trim()) return;
    setIsSuggesting(true);
    try {
      const suggested = await suggestCategory(description, categories, type);
      setCategory(suggested);
    } catch (error) {
      console.error("Failed to suggest category:", error);
    } finally {
      setIsSuggesting(false);
    }
  }, [description, categories, type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    const updatedTransaction: Transaction = {
      ...transaction,
      description,
      amount: parseFloat(amount),
      type,
      category,
      date,
    };

    if (isRecurring) {
        const originalDate = date; 
        const nextDueDate = new Date(originalDate);
        nextDueDate.setMonth(nextDueDate.getMonth() + 1);
        
        updatedTransaction.recurringId = transaction.recurringId || transaction.id;
        updatedTransaction.recurring = {
            frequency: 'monthly',
            originalDate: originalDate,
            nextDueDate: nextDueDate.toISOString().split('T')[0],
        };
    } else {
        delete updatedTransaction.recurring;
    }
    
    onUpdateTransaction(updatedTransaction);
  };

  return (
    <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
        <div 
            className="bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
        >
            <h2 className="text-xl font-bold mb-4 text-white">Editar Transação</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col">
                    <label htmlFor="edit-description" className="text-sm font-medium text-gray-400 mb-1">Descrição</label>
                    <input
                        id="edit-description"
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                        required
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <label htmlFor="edit-amount" className="text-sm font-medium text-gray-400 mb-1">Valor</label>
                        <input
                            id="edit-amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                            required
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="edit-category" className="text-sm font-medium text-gray-400 mb-1">Categoria</label>
                        <div className="flex items-center gap-2">
                          <select
                              id="edit-category"
                              value={category}
                              onChange={(e) => setCategory(e.target.value as Category)}
                              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                          >
                              {topLevel.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                              {grouped.map(group => (
                                  <optgroup key={group.name} label={group.name}>
                                      {group.subcategories.map(subCat => (
                                          <option key={subCat} value={subCat}>
                                              &nbsp;&nbsp;{subCat.split(':')[1]}
                                          </option>
                                      ))}
                                  </optgroup>
                              ))}
                          </select>
                           <button type="button" onClick={handleSuggestCategory} disabled={isSuggesting || !description} className="p-2 bg-gray-600 hover:bg-gray-500 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed" title="Sugerir Categoria">
                              <SparklesIcon className={`w-5 h-5 ${isSuggesting ? 'animate-pulse text-yellow-400' : 'text-gray-300'}`} />
                          </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col">
                    <label htmlFor="edit-date" className="text-sm font-medium text-gray-400 mb-1">Data</label>
                    <input
                        id="edit-date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                        required
                    />
                    <div className="flex gap-2 mt-2">
                        <button type="button" onClick={() => setDate(getRelativeDate(0))} className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded-md transition">Hoje</button>
                        <button type="button" onClick={() => setDate(getRelativeDate(1))} className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded-md transition">Ontem</button>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-300">
                    <input type="checkbox" id="editIsRecurring" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} className="w-4 h-4 rounded text-emerald-600 bg-gray-700 border-gray-600 focus:ring-emerald-500" />
                    <label htmlFor="editIsRecurring">Transação recorrente (mensal)</label>
                </div>

                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-400 mb-1">Tipo</label>
                    <div className="flex rounded-md bg-gray-700 border border-gray-600">
                        <button type="button" onClick={() => setType('expense')} className={`flex-1 px-3 py-2 text-sm rounded-l-md transition ${type === 'expense' ? 'bg-red-500 text-white' : 'text-gray-300 hover:bg-gray-600'}`}>Despesa</button>
                        <button type="button" onClick={() => setType('income')} className={`flex-1 px-3 py-2 text-sm rounded-r-md transition ${type === 'income' ? 'bg-green-500 text-white' : 'text-gray-300 hover:bg-gray-600'}`}>Renda</button>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700 transition">Cancelar</button>
                    <button type="submit" className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition">Salvar Alterações</button>
                </div>
            </form>
        </div>
    </div>
  );
};

export default EditTransactionModal;