import React, { useState, useMemo } from 'react';
import { Goal } from '../types';
import TrophyIcon from './icons/TrophyIcon';
import PlusIcon from './icons/PlusIcon';
import GoalItem from './GoalItem';

interface GoalsTrackerProps {
    goals: Goal[];
    onAddGoal: (goal: Omit<Goal, 'id' | 'currentAmount' | 'status'>) => void;
    onAddContribution: (goalId: number, amount: number) => void;
    onEditGoal: (goal: Goal) => void;
    onDeleteGoal: (goal: Goal) => void;
    onCompleteGoal: (goalId: number) => void;
}

const AddGoalForm: React.FC<{ onAddGoal: GoalsTrackerProps['onAddGoal'], onCancel: () => void }> = ({ onAddGoal, onCancel }) => {
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [targetDate, setTargetDate] = useState('');
    const [priority, setPriority] = useState<'baixa' | 'media' | 'alta'>('media');

    const handleAddGoal = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && parseFloat(targetAmount) > 0 && targetDate) {
            onAddGoal({ name, targetAmount: parseFloat(targetAmount), targetDate, priority });
            setName('');
            setTargetAmount('');
            setTargetDate('');
            setPriority('media');
            onCancel(); // Close form on submit
        }
    };

    return (
        <form onSubmit={handleAddGoal} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-700/50 rounded-lg">
            <div className="md:col-span-2">
                <label htmlFor="goalName" className="text-sm font-medium text-gray-400 mb-1 block">Nome da Meta</label>
                <input id="goalName" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="ex: Fundo de Emergência" className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 transition" required />
            </div>
            <div>
                <label htmlFor="targetAmount" className="text-sm font-medium text-gray-400 mb-1 block">Valor Alvo</label>
                <input id="targetAmount" type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} placeholder="ex: 5000" className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 transition" required />
            </div>
            <div>
                <label htmlFor="targetDate" className="text-sm font-medium text-gray-400 mb-1 block">Data Alvo</label>
                <input id="targetDate" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 transition" required />
            </div>
            <div className="md:col-span-2">
                <label htmlFor="priority" className="text-sm font-medium text-gray-400 mb-1 block">Prioridade</label>
                <select id="priority" value={priority} onChange={(e) => setPriority(e.target.value as any)} className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 transition">
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                </select>
            </div>
            <div className="md:col-span-2 flex justify-end gap-3">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md text-gray-300 hover:bg-gray-600 transition">Cancelar</button>
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center gap-2 transition">
                    <PlusIcon className="w-5 h-5" /> Adicionar Meta
                </button>
            </div>
        </form>
    );
};

const GoalsTracker: React.FC<GoalsTrackerProps> = (props) => {
    const [isAdding, setIsAdding] = useState(false);
    const [view, setView] = useState<'ativa' | 'concluída'>('ativa');

    const { activeGoals, completedGoals } = useMemo(() => {
        const active: Goal[] = [];
        const completed: Goal[] = [];
        props.goals.forEach(goal => {
            if (goal.status === 'concluída') completed.push(goal);
            else active.push(goal);
        });
        return { activeGoals: active, completedGoals: completed };
    }, [props.goals]);

    const goalsToShow = view === 'ativa' ? activeGoals : completedGoals;

    return (
        <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-y-3 mb-4">
                <div className="flex items-center gap-3">
                    <TrophyIcon className="w-6 h-6 text-yellow-400" />
                    <h2 className="text-xl font-bold text-white">Metas Financeiras</h2>
                </div>
                {!isAdding && (
                     <button onClick={() => setIsAdding(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center gap-2 transition text-sm">
                        <PlusIcon className="w-5 h-5" /> Adicionar Nova Meta
                    </button>
                )}
            </div>

            {isAdding && <AddGoalForm onAddGoal={props.onAddGoal} onCancel={() => setIsAdding(false)} />}
            
            <div className="border-b border-gray-700 mb-4">
                <nav className="flex space-x-4" aria-label="Tabs">
                    <button onClick={() => setView('ativa')} className={`px-3 py-2 font-medium text-sm rounded-t-md ${view === 'ativa' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-400 hover:text-white'}`}>
                        Ativas ({activeGoals.length})
                    </button>
                    <button onClick={() => setView('concluída')} className={`px-3 py-2 font-medium text-sm rounded-t-md ${view === 'concluída' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-400 hover:text-white'}`}>
                        Concluídas ({completedGoals.length})
                    </button>
                </nav>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
                {goalsToShow.length > 0 ? (
                    goalsToShow.map(goal => <GoalItem key={goal.id} goal={goal} {...props} />)
                ) : (
                    <p className="text-gray-400 md:col-span-2 text-center py-8">
                        {view === 'ativa' ? "Você não tem metas ativas. Adicione uma para começar!" : "Você ainda não concluiu nenhuma meta."}
                    </p>
                )}
            </div>
        </div>
    );
};

export default GoalsTracker;