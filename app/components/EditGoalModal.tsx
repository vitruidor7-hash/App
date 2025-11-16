import React, { useState, useEffect } from 'react';
import { Goal } from '../types';

interface EditGoalModalProps {
  goal: Goal;
  onUpdateGoal: (goal: Goal) => void;
  onClose: () => void;
}

const EditGoalModal: React.FC<EditGoalModalProps> = ({ goal, onUpdateGoal, onClose }) => {
    const [name, setName] = useState(goal.name);
    const [targetAmount, setTargetAmount] = useState(goal.targetAmount.toString());
    const [targetDate, setTargetDate] = useState(goal.targetDate || '');
    const [priority, setPriority] = useState<'baixa' | 'media' | 'alta'>(goal.priority || 'media');
    const [currentAmount, setCurrentAmount] = useState(goal.currentAmount.toString());

    useEffect(() => {
        setName(goal.name);
        setTargetAmount(goal.targetAmount.toString());
        setTargetDate(goal.targetDate || '');
        setPriority(goal.priority || 'media');
        setCurrentAmount(goal.currentAmount.toString());
    }, [goal]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const parsedTarget = parseFloat(targetAmount);
        const parsedCurrent = parseFloat(currentAmount);

        if (name && parsedTarget > 0 && targetDate) {
            onUpdateGoal({ 
                ...goal, 
                name, 
                targetAmount: parsedTarget, 
                targetDate, 
                priority,
                currentAmount: Math.min(parsedCurrent, parsedTarget) // Ensure current doesn't exceed target
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose} aria-modal="true" role="dialog">
            <div className="bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4 text-white">Editar Meta</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label htmlFor="editGoalName" className="text-sm font-medium text-gray-400 mb-1 block">Nome da Meta</label>
                        <input id="editGoalName" type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 transition" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="editTargetAmount" className="text-sm font-medium text-gray-400 mb-1 block">Valor Alvo</label>
                            <input id="editTargetAmount" type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 transition" required />
                        </div>
                        <div>
                            <label htmlFor="editCurrentAmount" className="text-sm font-medium text-gray-400 mb-1 block">Valor Atual</label>
                            <input id="editCurrentAmount" type="number" value={currentAmount} onChange={(e) => setCurrentAmount(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 transition" required />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="editTargetDate" className="text-sm font-medium text-gray-400 mb-1 block">Data Alvo</label>
                        <input id="editTargetDate" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 transition" required />
                    </div>
                    <div>
                        <label htmlFor="editPriority" className="text-sm font-medium text-gray-400 mb-1 block">Prioridade</label>
                        <select id="editPriority" value={priority} onChange={(e) => setPriority(e.target.value as any)} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 transition">
                            <option value="baixa">Baixa</option>
                            <option value="media">Média</option>
                            <option value="alta">Alta</option>
                        </select>
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

export default EditGoalModal;