import React, { useState } from 'react';
import { Goal } from '../types';
import PlusIcon from './icons/PlusIcon';
import PencilIcon from './icons/PencilIcon';
import TrashIcon from './icons/TrashIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';

interface GoalItemProps {
    goal: Goal;
    onAddContribution: (goalId: number, amount: number) => void;
    onEditGoal: (goal: Goal) => void;
    onDeleteGoal: (goal: Goal) => void;
    onCompleteGoal: (goalId: number) => void;
}

const priorityStyles: Record<'baixa' | 'media' | 'alta', { bg: string; text: string }> = {
    baixa: { bg: 'bg-gray-600', text: 'text-gray-200' },
    media: { bg: 'bg-yellow-600', text: 'text-yellow-100' },
    alta: { bg: 'bg-red-600', text: 'text-red-100' },
};

const GoalItem: React.FC<GoalItemProps> = ({ goal, onAddContribution, onEditGoal, onDeleteGoal, onCompleteGoal }) => {
    const [contribution, setContribution] = useState('');
    const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);

    const handleAddContribution = (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(contribution);
        if (amount > 0) {
            onAddContribution(goal.id, amount);
            setContribution('');
        }
    };
    
    const calculateTimeLeft = () => {
        if (!goal.targetDate) return { months: 0, days: 0, isPast: false };
        const target = new Date(goal.targetDate);
        const now = new Date();
        if (target < now) return { months: 0, days: 0, isPast: true };

        const diff = target.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        const months = Math.floor(days / 30.44); // Average days in a month
        const remainingDays = days % 30;
        return { months, days: remainingDays, isPast: false };
    };
    
    const calculateMonthlySavings = () => {
        const remainingAmount = goal.targetAmount - goal.currentAmount;
        if (remainingAmount <= 0) return 0;
        const { months, days, isPast } = calculateTimeLeft();
        if (isPast) return 0;
        const totalMonthsLeft = months + (days > 0 ? 1 : 0);
        return totalMonthsLeft > 0 ? remainingAmount / totalMonthsLeft : remainingAmount;
    };

    const timeLeft = calculateTimeLeft();
    const monthlySavings = calculateMonthlySavings();
    const priority = goal.priority || 'baixa';

    return (
        <div className="bg-gray-700/50 p-4 rounded-lg flex flex-col justify-between gap-3">
            <div>
                <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-white pr-2">{goal.name}</p>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${priorityStyles[priority].bg} ${priorityStyles[priority].text}`}>
                        {priority === 'media' ? 'Média' : priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </span>
                </div>
                <div className="flex justify-between items-baseline text-sm mb-1">
                    <span className="text-gray-400">Progresso</span>
                    <span className="font-semibold text-white">
                        R$ {goal.currentAmount.toLocaleString('pt-BR')} / R$ {goal.targetAmount.toLocaleString('pt-BR')}
                    </span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-3 relative">
                    <div className="bg-emerald-500 h-3 rounded-full" style={{ width: `${progress}%` }}></div>
                    <span className="absolute w-full h-full top-0 left-0 flex items-center justify-center text-xs font-bold text-black">{Math.round(progress)}%</span>
                </div>
            </div>

            {goal.status === 'ativa' && goal.targetDate && (
                 <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm bg-gray-800/50 p-2 rounded-md">
                    <div className="text-gray-400">Tempo Restante:</div>
                    <div className="text-white font-medium text-right">{timeLeft.isPast ? 'Vencido' : `${timeLeft.months}m ${timeLeft.days}d`}</div>
                    <div className="text-gray-400">Necessário/mês:</div>
                    <div className="text-white font-medium text-right">R$ {monthlySavings.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
            )}
            
            {goal.status === 'concluída' && (
                <p className="text-center text-emerald-400 font-semibold text-sm">Concluído!</p>
            )}

            {goal.status === 'ativa' && (
                <div className="flex items-center gap-2 mt-2">
                    <form onSubmit={handleAddContribution} className="flex-1 flex items-center gap-2">
                        <input type="number" value={contribution} onChange={(e) => setContribution(e.target.value)} placeholder="Contribuir" className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-1.5 text-white text-sm focus:ring-1 focus:ring-emerald-500 transition" />
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-2 rounded-md flex items-center justify-center transition" aria-label="Adicionar Contribuição">
                            <PlusIcon className="w-4 h-4" />
                        </button>
                    </form>
                    <div className="flex items-center">
                        <button onClick={() => onEditGoal(goal)} className="p-2 text-gray-400 hover:text-white" aria-label="Editar Meta"><PencilIcon className="w-4 h-4" /></button>
                         {progress < 100 && (
                            <button onClick={() => onCompleteGoal(goal.id)} className="p-2 text-gray-400 hover:text-green-400" aria-label="Marcar como Concluído"><CheckCircleIcon className="w-4 h-4" /></button>
                         )}
                        <button onClick={() => onDeleteGoal(goal)} className="p-2 text-gray-400 hover:text-red-400" aria-label="Excluir Meta"><TrashIcon className="w-4 h-4" /></button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GoalItem;