
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Transaction, Category, TransactionType, Goal } from './types';
import Header from './components/Header';
import BudgetSummary from './components/BudgetSummary';
import TransactionList from './components/TransactionList';
import AddTransactionForm from './components/AddTransactionForm';
import ChatPanel from './components/ChatPanel';
import SpendingCharts from './components/SpendingCharts';
import TransactionFilters from './components/TransactionFilters';
import CategoryManager from './components/CategoryManager';
import GoalsTracker from './components/GoalsTracker';
import EditTransactionModal from './components/EditTransactionModal';
import ConfirmationModal from './components/ConfirmationModal';
import EditGoalModal from './components/EditGoalModal';
import SparklesIcon from './components/icons/SparklesIcon';

const formatDate = (date: Date) => date.toISOString().split('T')[0];
const getRelativeDate = (monthsAgo: number = 0, date: number = 1): string => {
    const d = new Date();
    d.setDate(1); // Set to first of the month to avoid month-end issues
    d.setMonth(d.getMonth() - monthsAgo);
    d.setDate(date);
    return formatDate(d);
};

// Sample initial data
const initialTransactions: Transaction[] = [
  { id: 1, description: 'Salário Mensal', amount: 5000, type: 'income', category: 'Salário', date: getRelativeDate(0, 1) },
  { id: 2, description: 'Compras no Supermercado', amount: 150, type: 'expense', category: 'Alimentação:Supermercado', date: getRelativeDate(0, 5) },
  { 
    id: 3, 
    description: 'Aluguel', 
    amount: 1200, 
    type: 'expense', 
    category: 'Moradia', 
    date: getRelativeDate(2, 1),
    recurringId: 3,
    recurring: { frequency: 'monthly', originalDate: getRelativeDate(2, 1), nextDueDate: getRelativeDate(1, 1) }
  },
  { id: 4, description: 'Conta de Internet', amount: 60, type: 'expense', category: 'Contas:Internet', date: getRelativeDate(0, 10) },
  { id: 5, description: 'Jantar com amigos', amount: 80, type: 'expense', category: 'Alimentação:Restaurantes', date: getRelativeDate(0, 12) },
  { id: 6, description: 'Fones de ouvido novos', amount: 250, type: 'expense', category: 'Compras', date: getRelativeDate(0, 15) },
  { id: 7, description: 'Projeto Freelance', amount: 750, type: 'income', category: 'Freelance', date: getRelativeDate(0, 18) },
];


const initialCategories: Category[] = [
    'Salário', 
    'Freelance', 
    'Alimentação', 
    'Alimentação:Supermercado',
    'Alimentação:Restaurantes',
    'Moradia', 
    'Contas', 
    'Contas:Internet',
    'Contas:Eletricidade',
    'Social', 
    'Compras', 
    'Saúde', 
    'Transporte', 
    'Transporte:Gasolina',
    'Transporte:Público',
    'Economias', 
    'Outros',
    'Sem Categoria',
];

const initialGoals: Goal[] = [
  { id: 1, name: 'Férias no Havaí', targetAmount: 3000, currentAmount: 750, targetDate: '2024-12-31', priority: 'alta', status: 'ativa' },
  { id: 2, name: 'Notebook Novo', targetAmount: 1800, currentAmount: 1600, targetDate: '2024-09-01', priority: 'media', status: 'ativa' },
  { id: 3, name: 'Fundo de Emergência', targetAmount: 5000, currentAmount: 5000, targetDate: '2024-01-01', priority: 'alta', status: 'concluída' },
];

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [categories, setCategories] = useState<Category[]>(() => initialCategories.sort());
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deletingGoal, setDeletingGoal] = useState<Goal | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Effect to generate recurring transactions on load
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newTransactions: Transaction[] = [];
    const transactionsToUpdate: Transaction[] = [];

    transactions.forEach(t => {
      if (t.recurring) {
        let nextDueDate = new Date(t.recurring.nextDueDate);
        
        while (nextDueDate <= today) {
          const newTx: Transaction = {
            id: Math.random(),
            description: t.description,
            amount: t.amount,
            type: t.type,
            category: t.category,
            date: formatDate(nextDueDate),
            recurringId: t.recurringId,
          };
          newTransactions.push(newTx);

          if (t.recurring.frequency === 'monthly') {
            nextDueDate.setMonth(nextDueDate.getMonth() + 1);
          }
        }
        
        if (formatDate(nextDueDate) !== t.recurring.nextDueDate) {
          transactionsToUpdate.push({
            ...t,
            recurring: {
              ...t.recurring,
              nextDueDate: formatDate(nextDueDate),
            }
          });
        }
      }
    });

    if (newTransactions.length > 0 || transactionsToUpdate.length > 0) {
      setTransactions(prev => {
        const updated = prev.map(pt => {
          const update = transactionsToUpdate.find(ut => ut.id === pt.id);
          return update ? update : pt;
        });
        return [...updated, ...newTransactions];
      });
    }
  }, []); // Run only on initial mount


  // Filter state
  const [filters, setFilters] = useState<{
    dateFrom: string;
    dateTo: string;
    category: 'all' | Category;
    type: 'all' | TransactionType;
  }>({
    dateFrom: '',
    dateTo: '',
    category: 'all',
    type: 'all',
  });
  
  useEffect(() => {
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    setFilters(prevFilters => ({
        ...prevFilters,
        dateFrom: formatDate(firstDay),
        dateTo: formatDate(lastDay),
    }));
  }, [currentMonth]);


  const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'date'>, isRecurring: boolean) => {
    const transactionDate = new Date();
    const dateString = formatDate(transactionDate);

    const newTransaction: Transaction = {
      ...transaction,
      id: Math.random(),
      date: dateString,
    };

    if (isRecurring) {
        const nextDueDate = new Date(transactionDate);
        nextDueDate.setMonth(nextDueDate.getMonth() + 1);
        
        newTransaction.recurringId = newTransaction.id;
        newTransaction.recurring = {
            frequency: 'monthly',
            originalDate: dateString,
            nextDueDate: formatDate(nextDueDate),
        };
    }
    setTransactions(prev => [newTransaction, ...prev]);
  }, []);


  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
  };
  
  const handleUpdateTransaction = (transaction: Transaction) => {
    updateTransaction(transaction);
    setEditingTransaction(null);
  };

  const deleteTransaction = (id: number) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    setDeletingTransaction(null);
  };

  const addCategory = (categoryName: string, parent?: Category) => {
    const newCategory = parent ? `${parent}:${categoryName}` : categoryName;
    if (categoryName && !categories.includes(newCategory)) {
        setCategories(prev => [...prev, newCategory].sort());
        return true;
    }
    return false;
  };
  
  const addGoal = (goal: Omit<Goal, 'id' | 'currentAmount' | 'status'>) => {
    const newGoal: Goal = {
      ...goal,
      id: Math.random(),
      currentAmount: 0,
      status: 'ativa',
    };
    setGoals(prev => [newGoal, ...prev]);
  };

  const updateGoal = (updatedGoal: Goal) => {
    setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
    setEditingGoal(null);
  };

  const deleteGoal = (id: number) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    setDeletingGoal(null);
  };

  const completeGoal = (goalId: number) => {
    setGoals(goals.map(g => g.id === goalId ? { ...g, status: 'concluída', currentAmount: g.targetAmount } : g));
  };
  
  const addContribution = useCallback((goalId: number, amount: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal && goal.status === 'ativa') {
        setGoals(goals.map(g => g.id === goalId ? { ...g, currentAmount: Math.min(g.currentAmount + amount, g.targetAmount) } : g));
        addTransaction({
            description: `Contribuição para ${goal.name}`,
            amount: amount,
            type: 'expense',
            category: 'Economias',
        }, false);
    }
  }, [goals, addTransaction]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (!filters.dateFrom || !filters.dateTo) return false; // Don't show anything until dates are set
      const transactionDate = new Date(t.date);
      const dateFrom = new Date(filters.dateFrom);
      const dateTo = new Date(filters.dateTo);

      if (transactionDate < dateFrom) return false;
      if (transactionDate > dateTo) return false;
      if (filters.category !== 'all' && !t.category.startsWith(filters.category)) return false;
      if (filters.type !== 'all' && t.type !== filters.type) return false;

      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filters]);
  
  const { totalIncome, totalExpenses, balance } = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      totalIncome: income,
      totalExpenses: expenses,
      balance: income - expenses,
    };
  }, [filteredTransactions]);


  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} />
      <main className="container mx-auto p-4 lg:p-8 pb-24 lg:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <BudgetSummary income={totalIncome} expenses={totalExpenses} balance={balance} />
            <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg">
                <TransactionFilters filters={filters} setFilters={setFilters} categories={categories} />
                <TransactionList 
                    transactions={filteredTransactions} 
                    onEditTransaction={setEditingTransaction}
                    onDeleteTransaction={setDeletingTransaction}
                />
            </div>
             <GoalsTracker 
                goals={goals}
                onAddGoal={addGoal}
                onAddContribution={addContribution}
                onEditGoal={setEditingGoal}
                onDeleteGoal={setDeletingGoal}
                onCompleteGoal={completeGoal}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            <AddTransactionForm onAddTransaction={addTransaction} categories={categories} />
            <CategoryManager categories={categories} onAddCategory={addCategory} />
            <SpendingCharts transactions={filteredTransactions} />
            <div className="hidden lg:block sticky top-24">
                <ChatPanel 
                    transactions={filteredTransactions} 
                    totalIncome={totalIncome}
                    totalExpenses={totalExpenses}
                />
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Sticky Footer */}
      <footer className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-800/80 backdrop-blur-md border-t border-gray-700/50 p-3 z-20">
          <button onClick={() => setIsChatOpen(true)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-md flex items-center justify-center gap-2 transition">
              <SparklesIcon className="w-5 h-5" />
              Assistente IA
          </button>
      </footer>

      {/* Mobile Chat Overlay */}
      {isChatOpen && (
          <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex flex-col justify-end"
              onClick={() => setIsChatOpen(false)}>
              <div className="h-[90vh] bg-gray-800 rounded-t-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
                  <ChatPanel 
                      transactions={filteredTransactions} 
                      totalIncome={totalIncome}
                      totalExpenses={totalExpenses}
                      isMobileView={true} 
                      onClose={() => setIsChatOpen(false)} 
                  />
              </div>
          </div>
      )}
      
      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          onUpdateTransaction={handleUpdateTransaction}
          onClose={() => setEditingTransaction(null)}
          categories={categories}
        />
      )}
      {deletingTransaction && (
        <ConfirmationModal
          isOpen={!!deletingTransaction}
          onClose={() => setDeletingTransaction(null)}
          onConfirm={() => deleteTransaction(deletingTransaction.id)}
          title="Excluir Transação"
          message={`Tem certeza de que deseja excluir "${deletingTransaction.description}"? Esta ação não pode ser desfeita.`}
        />
      )}
      {editingGoal && (
        <EditGoalModal
            goal={editingGoal}
            onUpdateGoal={updateGoal}
            onClose={() => setEditingGoal(null)}
        />
      )}
      {deletingGoal && (
        <ConfirmationModal
          isOpen={!!deletingGoal}
          onClose={() => setDeletingGoal(null)}
          onConfirm={() => deleteGoal(deletingGoal.id)}
          title="Excluir Meta"
          message={`Tem certeza de que deseja excluir a meta "${deletingGoal.name}"?`}
        />
      )}
    </div>
  );
};

export default App;
