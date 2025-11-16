

import React, { useState, useMemo } from 'react';
import { Category } from '../types';
import PlusIcon from './icons/PlusIcon';

interface CategoryManagerProps {
    categories: Category[];
    onAddCategory: (categoryName: string, parent?: Category) => boolean;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, onAddCategory }) => {
    const [newCategory, setNewCategory] = useState('');
    const [parent, setParent] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategory.trim()) {
            setError('O nome da categoria не pode estar vazio.');
            return;
        }
        const success = onAddCategory(newCategory.trim(), parent || undefined);
        if(success) {
            setNewCategory('');
            setParent('');
            setError('');
        } else {
            setError('Esta categoria ou subcategoria já existe.');
        }
    };
    
    const { topLevelCategories, categoryTree } = useMemo(() => {
        const tree = new Map<string, string[]>();
        const topLevel: string[] = [];
        categories.forEach(c => {
            if (c.includes(':')) {
                const [p, child] = c.split(':');
                if (!tree.has(p)) {
                    tree.set(p, []);
                }
                tree.get(p)!.push(child);
            } else {
                topLevel.push(c);
            }
        });
        // Ensure top-level categories that are also parents are in the topLevel array
        Array.from(tree.keys()).forEach(p => {
            if (!topLevel.includes(p)) {
                topLevel.push(p);
            }
        });
        return { topLevelCategories: topLevel.sort(), categoryTree: tree };
    }, [categories]);

    return (
        <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg h-full flex flex-col">
            <h2 className="text-xl font-bold mb-4 text-white">Gerenciar Categorias</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                        <label htmlFor="newCategory" className="sr-only">Nova Categoria</label>
                        <input
                            id="newCategory"
                            type="text"
                            value={newCategory}
                            onChange={(e) => {
                                setNewCategory(e.target.value);
                                setError('');
                            }}
                            placeholder="Nome da nova categoria"
                            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                        />
                    </div>
                     <div>
                        <label htmlFor="parentCategory" className="sr-only">Categoria Pai</label>
                        <select
                            id="parentCategory"
                            value={parent}
                            onChange={(e) => setParent(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                        >
                            <option value="">Nenhuma (nível principal)</option>
                            {topLevelCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                </div>
                {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
                <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-md flex items-center justify-center gap-2 transition w-full"
                    aria-label="Adicionar Categoria"
                >
                    <PlusIcon className="w-5 h-5" /> Adicionar Categoria
                </button>
            </form>
            <div className="flex-1 overflow-y-auto">
                <p className="text-sm font-medium text-gray-400 mb-2">Suas Categorias:</p>
                <ul className="space-y-2">
                    {topLevelCategories.map(cat => (
                        <li key={cat}>
                            <span className="bg-gray-700 text-gray-200 text-sm font-medium px-3 py-1 rounded-full">
                                {cat}
                            </span>
                            {categoryTree.has(cat) && (
                                <ul className="mt-2 pl-6 space-y-1">
                                    {categoryTree.get(cat)!.map(subCat => (
                                         <li key={subCat}>
                                            <span className="bg-gray-600 text-gray-300 text-xs font-medium px-2 py-1 rounded-full">
                                                {subCat}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default CategoryManager;