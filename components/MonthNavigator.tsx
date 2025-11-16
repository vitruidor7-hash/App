import React from 'react';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';

interface MonthNavigatorProps {
    currentMonth: Date;
    setCurrentMonth: (date: Date) => void;
}

const MonthNavigator: React.FC<MonthNavigatorProps> = ({ currentMonth, setCurrentMonth }) => {
    const handlePrevMonth = () => {
        const newDate = new Date(currentMonth);
        newDate.setDate(1); // Set to first of month to avoid issues
        newDate.setMonth(newDate.getMonth() - 1);
        setCurrentMonth(newDate);
    };

    const handleNextMonth = () => {
        const newDate = new Date(currentMonth);
        newDate.setDate(1); // Set to first of month to avoid issues
        newDate.setMonth(newDate.getMonth() + 1);
        setCurrentMonth(newDate);
    };

    const monthYear = currentMonth.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

    return (
        <div className="flex items-center justify-end gap-2 mt-4 md:mt-0">
            <button 
                onClick={handlePrevMonth} 
                className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                aria-label="Mês anterior"
            >
                <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-semibold text-white w-40 text-center">{monthYear}</h2>
            <button 
                onClick={handleNextMonth} 
                className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                aria-label="Próximo mês"
            >
                <ChevronRightIcon className="w-6 h-6" />
            </button>
        </div>
    );
};

export default MonthNavigator;