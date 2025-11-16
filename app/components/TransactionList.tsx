import React from 'react';
import { Transaction } from '../types';
import PencilIcon from './icons/PencilIcon';
import TrashIcon from './icons/TrashIcon';
import RefreshIcon from './icons/RefreshIcon';

interface TransactionListProps {
  transactions: Transaction[];
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (transaction: Transaction) => void;
}

const TransactionItem: React.FC<{ transaction: Transaction, onEdit: (transaction: Transaction) => void, onDelete: (transaction: Transaction) => void }> = ({ transaction, onEdit, onDelete }) => {
    const { description, amount, type, category, date, recurring } = transaction;
    const amountColor = type === 'income' ? 'text-green-400' : 'text-red-400';
    const sign = type === 'income' ? '+' : '-';

    return (
        <li className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-200">
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{description}</span>
                    {recurring && <span title="Esta é a origem de uma transação recorrente"><RefreshIcon className="w-4 h-4 text-blue-400" /></span>}
                </div>
                <span className="text-sm text-gray-400">{category} - {new Date(date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-bold text-lg ${amountColor}`}>{sign}R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <button onClick={() => onEdit(transaction)} className="text-gray-400 hover:text-white p-2 rounded-full transition-colors" aria-label="Editar transação">
                <PencilIcon className="w-5 h-5" />
              </button>
              <button onClick={() => onDelete(transaction)} className="text-gray-400 hover:text-red-400 p-2 rounded-full transition-colors" aria-label="Excluir transação">
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
        </li>
    );
};


const TransactionList: React.FC<TransactionListProps> = ({ transactions, onEditTransaction, onDeleteTransaction }) => {
  return (
    <>
      <h2 className="text-xl font-bold mb-4 text-white">Transações</h2>
      {transactions.length > 0 ? (
         <ul className="space-y-3 overflow-y-auto max-h-96 pr-2">
            {transactions.map(transaction => (
                <TransactionItem key={transaction.id} transaction={transaction} onEdit={onEditTransaction} onDelete={onDeleteTransaction} />
            ))}
        </ul>
      ) : (
        <div className="flex items-center justify-center h-48 border-2 border-dashed border-gray-700 rounded-lg">
            <p className="text-gray-400">Nenhuma transação corresponde aos seus filtros.</p>
        </div>
      )}
    </>
  );
};

export default TransactionList;