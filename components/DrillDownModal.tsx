import React from 'react';
import { X, User, MapPin, Calendar, Clock, DollarSign } from 'lucide-react';
import { DriverRecord } from '../types';

interface DrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: DriverRecord[];
}

const DrillDownModal: React.FC<DrillDownModalProps> = ({ isOpen, onClose, title, data }) => {
  if (!isOpen) return null;

  const calculateCost = (record: DriverRecord) => {
      const salary = record.baseSalary || 0;
      if (salary === 0) return 0;
      
      const hourlyRate = salary / 220;
      const cost50 = hourlyRate * 1.5 * record.he50;
      const cost100 = hourlyRate * 2.0 * record.he100;
      return cost50 + cost100;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-5xl h-[80vh] flex flex-col shadow-2xl relative">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-surfaceHighlight/50">
          <div>
             <h2 className="text-2xl font-display font-bold text-white mb-1">Detalhes: {title}</h2>
             <p className="text-textMuted text-sm">{data.length} registros encontrados</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-textMuted hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto p-6">
           <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-surface z-10 shadow-lg">
              <tr className="text-textMuted text-xs uppercase tracking-wider font-bold">
                <th className="p-4 border-b border-white/10 bg-surface"><User size={14} className="inline mr-1"/> Motorista</th>
                <th className="p-4 border-b border-white/10 bg-surface"><MapPin size={14} className="inline mr-1"/> Filial</th>
                <th className="p-4 border-b border-white/10 bg-surface"><Calendar size={14} className="inline mr-1"/> Mês</th>
                <th className="p-4 border-b border-white/10 text-right bg-surface text-primary">HE 50%</th>
                <th className="p-4 border-b border-white/10 text-right bg-surface text-secondary">HE 100%</th>
                <th className="p-4 border-b border-white/10 text-right bg-surface text-white">Total HE</th>
                <th className="p-4 border-b border-white/10 text-right bg-surface text-accent">Noturno</th>
                <th className="p-4 border-b border-white/10 text-right bg-surface text-green-400"><DollarSign size={14} className="inline mr-1"/> Valor Est. (R$)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {data.map((row) => {
                const estimatedCost = calculateCost(row);
                return (
                    <tr key={row.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-medium text-white">{row.nome}</td>
                        <td className="p-4 text-textMuted">{row.filial}</td>
                        <td className="p-4 text-textMuted">{row.referenceDate}</td>
                        <td className="p-4 text-right font-mono text-primary">{row.he50.toFixed(1)}</td>
                        <td className="p-4 text-right font-mono text-secondary">{row.he100.toFixed(1)}</td>
                        <td className="p-4 text-right font-mono font-bold text-white">{(row.he50 + row.he100).toFixed(1)}</td>
                        <td className="p-4 text-right font-mono text-accent">{row.adicionalNoturno.toFixed(1)}</td>
                        <td className="p-4 text-right font-mono text-green-400 font-bold">
                            {estimatedCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                    </tr>
                );
              })}
            </tbody>
           </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-surfaceHighlight/30 flex justify-end">
            <button 
                onClick={onClose}
                className="px-6 py-2 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl transition-colors"
            >
                Fechar
            </button>
        </div>
      </div>
    </div>
  );
};

export default DrillDownModal;