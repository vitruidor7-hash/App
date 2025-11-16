
import React from 'react';

interface BudgetSummaryProps {
  income: number;
  expenses: number;
  balance: number;
}

const SummaryCard: React.FC<{ title: string; amount: number; colorClass: string }> = ({ title, amount, colorClass }) => (
    <div className="bg-gray-800 p-6 rounded-xl flex flex-col justify-between shadow-lg">
        <h3 className="text-gray-400 text-lg font-medium">{title}</h3>
        <p className={`text-3xl font-bold ${colorClass}`}>R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
    </div>
);

const BudgetSummary: React.FC<BudgetSummaryProps> = ({ income, expenses, balance }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      <SummaryCard title="Renda Total" amount={income} colorClass="text-green-400" />
      <SummaryCard title="Despesas Totais" amount={expenses} colorClass="text-red-400" />
      <SummaryCard title="Saldo Atual" amount={balance} colorClass={balance >= 0 ? "text-blue-400" : "text-yellow-400"} />
    </div>
  );
};

export default BudgetSummary;