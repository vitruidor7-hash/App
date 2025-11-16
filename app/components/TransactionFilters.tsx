

import React, { useMemo } from 'react';
import { Category, TransactionType } from '../types';
import FilterIcon from './icons/FilterIcon';
import XCircleIcon from './icons/XCircleIcon';
import { structureCategoriesForSelect } from '../utils/categoryUtils';

interface TransactionFiltersProps {
    filters: {
        dateFrom: string;
        dateTo: string;
        category: 'all' | Category;
        type: 'all' | TransactionType;
    };
    setFilters: React.Dispatch<React.SetStateAction<any>>;
    categories: Category[];
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({ filters, setFilters, categories }) => {
    
    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev: any) => ({ ...prev, [key]: value }));
    };

    const resetFilters = () => {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
        setFilters({ dateFrom: firstDay, dateTo: lastDay, category: 'all', type: 'all' });
    };

    const isFiltered = filters.category !== 'all' || filters.type !== 'all';
    
    const { topLevel, grouped } = useMemo(() => structureCategoriesForSelect(categories), [categories]);

    return (
        <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
                <FilterIcon className="w-6 h-6 text-gray-400" />
                <h3 className="text-lg font-semibold text-white">Filtros</h3>
                {isFiltered && (
                    <button onClick={resetFilters} className="ml-auto text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                        <XCircleIcon className="w-4 h-4" />
                        Limpar Filtros
                    </button>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Date From */}
                <div className="flex flex-col">
                    <label htmlFor="dateFrom" className="text-sm font-medium text-gray-400 mb-1">Data Inicial</label>
                    <input
                        id="dateFrom" type="date" value={filters.dateFrom}
                        onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    />
                </div>
                {/* Date To */}
                <div className="flex flex-col">
                    <label htmlFor="dateTo" className="text-sm font-medium text-gray-400 mb-1">Data Final</label>
                    <input
                        id="dateTo" type="date" value={filters.dateTo}
                        onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    />
                </div>
                {/* Category */}
                <div className="flex flex-col">
                    <label htmlFor="filterCategory" className="text-sm font-medium text-gray-400 mb-1">Categoria</label>
                    <select
                        id="filterCategory" value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    >
                        <option value="all">Todas as Categorias</option>
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
                </div>
                {/* Type */}
                <div className="flex flex-col">
                    <label htmlFor="filterType" className="text-sm font-medium text-gray-400 mb-1">Tipo</label>
                    <select
                        id="filterType" value={filters.type}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    >
                        <option value="all">Todos os Tipos</option>
                        <option value="expense">Despesa</option>
                        <option value="income">Renda</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default TransactionFilters;