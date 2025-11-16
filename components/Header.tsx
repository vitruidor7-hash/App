
import React from 'react';
import MonthNavigator from './MonthNavigator';

interface HeaderProps {
    currentMonth: Date;
    setCurrentMonth: (date: Date) => void;
}

const Header: React.FC<HeaderProps> = ({ currentMonth, setCurrentMonth }) => {
  return (
    <header className="sticky top-0 z-20 bg-gray-800/90 backdrop-blur-md shadow-md border-b border-gray-700/50">
      <div className="container mx-auto px-4 lg:px-8 py-4 flex flex-wrap justify-between items-center gap-4">
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-emerald-400 tracking-tight">
              Amigo Orçamentário Gemini
            </h1>
            <p className="text-gray-400 mt-1">Seu Assistente Financeiro com IA</p>
        </div>
        <MonthNavigator currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} />
      </div>
    </header>
  );
};

export default Header;
