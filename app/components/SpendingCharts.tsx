


import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import ChartPieIcon from './icons/ChartPieIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import TrendingUpIcon from './icons/TrendingUpIcon';

interface SpendingChartsProps {
    transactions: Transaction[];
}

type ChartMode = 'category' | 'time' | 'trend';

const colors = [
    '#34D399', '#60A5FA', '#F87171', '#FBBF24', '#A78BFA', '#EC4899', '#2DD4BF', '#818CF8'
];

// Donut Chart Component
const CategoryDonutChart: React.FC<{ data: { name: string; value: number }[] }> = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if(total === 0) return <div className="flex items-center justify-center h-full text-gray-400">Sem dados de despesas para exibir.</div>;

    let accumulated = 0;
    const chartData = data.map((item, index) => {
        const percent = item.value / total;
        const offset = accumulated / total;
        accumulated += item.value;
        return { ...item, percent, offset, color: colors[index % colors.length] };
    });

    return (
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 p-4 h-full">
             <svg viewBox="0 0 36 36" className="w-48 h-48 block">
                <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#404040" strokeWidth="3.8"></circle>
                {chartData.map(item => (
                    <circle
                        key={item.name}
                        cx="18" cy="18" r="15.9155"
                        fill="transparent"
                        stroke={item.color}
                        strokeWidth="3.8"
                        strokeDasharray={`${item.percent * 100}, 100`}
                        strokeDashoffset={25 - (item.offset * 100)}
                        transform="rotate(-90 18 18)"
                    ></circle>
                ))}
            </svg>
            <div className="flex flex-col gap-2 text-sm max-w-[200px] w-full">
                {chartData.slice(0, 5).map(item => (
                    <div key={item.name} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                        <span className="text-gray-300 truncate" title={item.name}>{item.name}</span>
                        <span className="font-semibold text-white ml-auto">R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Bar Chart Component
const TimeBarChart: React.FC<{ data: { name: string; value: number }[] }> = ({ data }) => {
    const maxValue = Math.max(...data.map(item => item.value), 0);
    if(maxValue === 0) return <div className="flex items-center justify-center h-full text-gray-400">Sem dados de despesas para exibir.</div>;

    return (
        <div className="flex justify-around items-end gap-1 h-full p-4 pt-0">
            {data.map((item, index) => (
                <div key={index} className="flex flex-col items-center gap-2 flex-1 h-full justify-end">
                    <div className="w-full h-full flex items-end relative group">
                        <div 
                            className="w-full rounded-t-md transition-all duration-300 ease-in-out hover:opacity-80" 
                            style={{ 
                                height: `${(item.value / maxValue) * 100}%`,
                                backgroundColor: item.value > 0 ? colors[index % colors.length] : 'transparent'
                            }}
                        >
                          {item.value > 0 && (
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded-md shadow-lg z-10">
                                R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                          )}
                        </div>
                    </div>
                    <span className="text-xs text-gray-400">{item.name}</span>
                </div>
            ))}
        </div>
    );
};

// Trend Line Chart Component
const TrendLineChart: React.FC<{ data: { day: number, cumulative: number }[] }> = ({ data }) => {
    if (data.length === 0) return <div className="flex items-center justify-center h-full text-gray-400">Sem dados de despesas para exibir.</div>;

    const maxValue = Math.max(...data.map(item => item.cumulative));
    const maxDay = data.length;
    const chartWidth = 280;
    const chartHeight = 180;
    const padding = { top: 10, bottom: 10, left: 0, right: 0 };

    const getX = (day: number) => padding.left + ((day - 1) / (maxDay - 1)) * (chartWidth - padding.left - padding.right);
    const getY = (value: number) => (chartHeight - padding.top - padding.bottom) - (value / maxValue) * (chartHeight - padding.top - padding.bottom) + padding.top;

    const path = data.map((point, i) => {
        const x = getX(point.day);
        const y = getY(point.cumulative);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    return (
        <div className="relative h-full w-full p-4 pr-8 pt-2">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
                {/* Y-axis labels and grid lines */}
                <text x="-5" y={getY(maxValue)} dy=".32em" textAnchor="end" className="text-xs fill-gray-400">R${maxValue.toLocaleString('pt-BR', {maximumFractionDigits:0})}</text>
                <line x1="0" y1={getY(maxValue)} x2={chartWidth} y2={getY(maxValue)} className="stroke-gray-700" strokeWidth="0.5" strokeDasharray="2,2" />

                <text x="-5" y={getY(maxValue / 2)} dy=".32em" textAnchor="end" className="text-xs fill-gray-400">R${(maxValue/2).toLocaleString('pt-BR', {maximumFractionDigits:0})}</text>
                <line x1="0" y1={getY(maxValue / 2)} x2={chartWidth} y2={getY(maxValue / 2)} className="stroke-gray-700" strokeWidth="0.5" strokeDasharray="2,2" />

                <text x="-5" y={getY(0)} dy=".32em" textAnchor="end" className="text-xs fill-gray-400">R$0</text>
                <line x1="0" y1={getY(0)} x2={chartWidth} y2={getY(0)} className="stroke-gray-500" strokeWidth="1" />
                
                {/* Gradient under the line */}
                <defs>
                    <linearGradient id="line-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{stopColor: 'rgba(52, 211, 153, 0.4)'}} />
                        <stop offset="100%" style={{stopColor: 'rgba(52, 211, 153, 0)'}} />
                    </linearGradient>
                </defs>
                <path d={`${path} V ${getY(0)} H ${getX(1)} Z`} fill="url(#line-gradient)" />
                
                {/* Path */}
                <path d={path} fill="none" className="stroke-emerald-400" strokeWidth="2" />
                
                {/* Data points with tooltips */}
                {data.map((point) => (
                    <g key={point.day} className="group" transform={`translate(${getX(point.day)}, ${getY(point.cumulative)})`}>
                         <circle r="6" className="fill-emerald-400/20 opacity-0 group-hover:opacity-100" />
                         <circle r="3" className="fill-emerald-400" />
                         <g transform="translate(0, -25)" className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <rect x="-45" y="-15" width="90" height="25" rx="4" className="fill-gray-900" />
                            <text x="0" y="0" textAnchor="middle" alignmentBaseline="middle" className="text-xs fill-white">
                                Dia {point.day}: R${point.cumulative.toLocaleString('pt-BR', {maximumFractionDigits:0})}
                            </text>
                         </g>
                    </g>
                ))}
            </svg>
        </div>
    );
};


const SpendingCharts: React.FC<SpendingChartsProps> = ({ transactions }) => {
    const [mode, setMode] = useState<ChartMode>('category');

    const categoryData = useMemo(() => {
        const expenseByCategory = transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => {
                const category = t.category || 'Uncategorized';
                acc[category] = (acc[category] || 0) + Number(t.amount);
                return acc;
            }, {} as Record<string, number>);

        return Object.entries(expenseByCategory)
            .map(([name, value]) => ({ name, value: Number(value) }))
            .sort((a, b) => b.value - a.value);
    }, [transactions]);

    const timeData = useMemo(() => {
        const expenseByDay: Record<string, number> = {};
        transactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                const day = new Date(t.date).getUTCDate().toString();
                expenseByDay[day] = (expenseByDay[day] || 0) + Number(t.amount);
            });
        
        const dateInMonth = transactions.length > 0 ? new Date(transactions[0].date) : new Date();

        const daysInMonth = new Date(
            dateInMonth.getUTCFullYear(),
            dateInMonth.getUTCMonth() + 1,
            0
        ).getUTCDate();
        
        const shouldSkipLabel = (day: number) => {
            if (daysInMonth > 20) {
                return day % 5 !== 0 && day !== 1 && day !== daysInMonth;
            }
            if (daysInMonth > 15) {
                return day % 2 !== 0 && day !== 1 && day !== daysInMonth;
            }
            return false;
        }

        const data = Array.from({length: daysInMonth}, (_, i) => {
            const day = (i + 1);
            return {
                name: shouldSkipLabel(day) ? '' : day.toString(),
                value: expenseByDay[day.toString()] || 0
            }
        });
        
        return data;

    }, [transactions]);

    const trendData = useMemo(() => {
        const expenseByDay: Record<number, number> = {};
        transactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                const day = new Date(t.date).getUTCDate();
                expenseByDay[day] = (expenseByDay[day] || 0) + Number(t.amount);
            });
        
        const dateInMonth = transactions.length > 0 ? new Date(transactions[0].date) : new Date();

        const daysInMonth = new Date(
            dateInMonth.getUTCFullYear(),
            dateInMonth.getUTCMonth() + 1,
            0
        ).getUTCDate();
        
        let cumulative = 0;
        const data = Array.from({length: daysInMonth}, (_, i) => {
            const day = i + 1;
            cumulative += expenseByDay[day] || 0;
            return { day, cumulative };
        });
        
        // Only return data if there's any expense
        return cumulative > 0 ? data : [];
    }, [transactions]);

    return (
        <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-y-2 mb-4">
                <h2 className="text-xl font-bold text-white">Análise de Gastos</h2>
                <div className="flex items-center bg-gray-700 p-1 rounded-full">
                    <button 
                        onClick={() => setMode('category')}
                        className={`flex items-center gap-2 px-3 py-1 text-sm font-semibold rounded-full transition ${mode === 'category' ? 'bg-emerald-500 text-white' : 'text-gray-400'}`}
                    >
                        <ChartPieIcon className="w-5 h-5" />
                        Por Categoria
                    </button>
                    <button 
                        onClick={() => setMode('time')}
                        className={`flex items-center gap-2 px-3 py-1 text-sm font-semibold rounded-full transition ${mode === 'time' ? 'bg-emerald-500 text-white' : 'text-gray-400'}`}
                    >
                        <ChartBarIcon className="w-5 h-5" />
                        Ao Longo do Tempo
                    </button>
                    <button 
                        onClick={() => setMode('trend')}
                        className={`flex items-center gap-2 px-3 py-1 text-sm font-semibold rounded-full transition ${mode === 'trend' ? 'bg-emerald-500 text-white' : 'text-gray-400'}`}
                    >
                        <TrendingUpIcon className="w-5 h-5" />
                        Tendências
                    </button>
                </div>
            </div>
            <div className="h-64">
                {mode === 'category' && <CategoryDonutChart data={categoryData} />}
                {mode === 'time' && <TimeBarChart data={timeData} />}
                {mode === 'trend' && <TrendLineChart data={trendData} />}
            </div>
        </div>
    );
};

export default SpendingCharts;