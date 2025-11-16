

import React, { useState, useMemo, useCallback } from 'react';
import { Transaction, Category, TransactionType } from '../types';
import PlusIcon from './icons/PlusIcon';
import SparklesIcon from './icons/SparklesIcon';
import { suggestCategory } from '../services/geminiService';
import { structureCategoriesForSelect } from '../utils/categoryUtils';

interface AddTransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'date'>, isRecurring: boolean) => void;
  categories: Category[];
}

const AddTransactionForm: React.FC<AddTransactionFormProps> = ({ onAddTransaction, categories }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState<Category>('Alimentação:Supermercado');
  const [isRecurring, setIsRecurring] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const { topLevel, grouped } = useMemo(() => structureCategoriesForSelect(categories), [categories]);

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

    onAddTransaction({
      description,
      amount: parseFloat(amount),
      type,
      category,
    }, isRecurring);

    setDescription('');
    setAmount('');
    setIsRecurring(false);
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg h-full">
      <h2 className="text-xl font-bold mb-4 text-white">Adicionar Nova Transação</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col">
          <label htmlFor="description" className="text-sm font-medium text-gray-400 mb-1">Descrição</label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="ex: Café"
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label htmlFor="amount" className="text-sm font-medium text-gray-400 mb-1">Valor</label>
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="ex: 4,50"
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                required
              />
            </div>
            <div className="flex flex-col">
                <label htmlFor="category" className="text-sm font-medium text-gray-400 mb-1">Categoria</label>
                <div className="flex items-center gap-2">
                    <select
                        id="category"
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
        
        <div className="flex items-center gap-2 text-sm text-gray-300">
            <input type="checkbox" id="isRecurring" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} className="w-4 h-4 rounded text-emerald-600 bg-gray-700 border-gray-600 focus:ring-emerald-500" />
            <label htmlFor="isRecurring">Tornar esta uma transação recorrente (mensal)</label>
        </div>

        <div className="flex items-end gap-2">
            <div className="w-full flex flex-col">
                <label className="text-sm font-medium text-gray-400 mb-1">Tipo</label>
                <div className="flex rounded-md bg-gray-700 border border-gray-600">
                    <button type="button" onClick={() => setType('expense')} className={`flex-1 px-3 py-2 text-sm rounded-l-md transition ${type === 'expense' ? 'bg-red-500 text-white' : 'text-gray-300 hover:bg-gray-600'}`}>Despesa</button>
                    <button type="button" onClick={() => setType('income')} className={`flex-1 px-3 py-2 text-sm rounded-r-md transition ${type === 'income' ? 'bg-green-500 text-white' : 'text-gray-300 hover:bg-gray-600'}`}>Renda</button>
                </div>
            </div>
            <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center transition h-[42px]"
                aria-label="Adicionar Transação"
              >
                <PlusIcon className="w-5 h-5" />
              </button>
        </div>
      </form>
    </div>
  );
};

export default AddTransactionForm;