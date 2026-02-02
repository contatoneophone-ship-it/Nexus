import React, { useMemo, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, LineChart, Line, LabelList, AreaChart, Area
} from 'recharts';
import { DriverRecord, KPIStats } from '../types';
import { Users, Clock, AlertTriangle, Briefcase, TrendingUp, Calendar, Filter, Target, CheckCircle, XCircle, Settings, ChevronDown, ChevronUp, DollarSign, Edit, Save, X, BarChart3 } from 'lucide-react';
import DrillDownModal from './DrillDownModal';

interface DashboardProps {
  data: DriverRecord[];
  onUpdateBranchSalary: (filial: string, newSalary: number) => void;
}

const KPICard = ({ title, value, icon: Icon, color, subtext }: any) => (
  <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
    <div className={`absolute -right-6 -top-6 opacity-10 group-hover:opacity-20 transition-opacity duration-500 text-[100px] text-${color}`}>
      <Icon />
    </div>
    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg bg-${color}/20 text-${color}`}>
          <Icon size={20} />
        </div>
        <h3 className="text-textMuted font-medium text-sm uppercase tracking-wider">{title}</h3>
      </div>
      <div className="text-4xl font-display font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-textMuted">{subtext}</div>
    </div>
    <div className={`absolute bottom-0 left-0 h-1 bg-${color} w-full`} />
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-white/10 p-3 rounded-lg shadow-xl backdrop-blur-md z-50">
        <p className="font-bold text-white mb-1">{label}</p>
        {payload.map((p: any, idx: number) => (
          <p key={idx} className="text-sm" style={{ color: p.color }}>
            {p.name}: {typeof p.value === 'number' && p.name.includes('R$') 
                ? p.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) 
                : p.value.toLocaleString()}
          </p>
        ))}
        {payload[0]?.payload?.hasPrev && (
            <div className={`text-xs mt-2 font-bold ${payload[0].payload.diff > 0 ? 'text-danger' : 'text-accent'}`}>
                Variação: {payload[0].payload.diff > 0 ? '+' : ''}{payload[0].payload.diff.toFixed(1)}%
            </div>
        )}
        <div className="mt-2 text-[10px] text-textMuted uppercase tracking-wider">Clique para ver detalhes</div>
      </div>
    );
  }
  return null;
};

const CustomLabel = (props: any) => {
  const { x, y, value, index, payload } = props;
  
  // Safety check
  if (!payload || !payload.hasPrev) return null;
  
  const isPositive = payload.diff > 0;
  // Use brighter colors for the label to pop against the dark chart
  const color = isPositive ? '#FF6B6B' : '#4DFFB2'; 
  const displayValue = `${isPositive ? '+' : ''}${payload.diff.toFixed(0)}%`;

  return (
    <g>
        <rect 
            x={x - 18} 
            y={y - 25} 
            width="36" 
            height="18" 
            rx="4" 
            fill="rgba(15, 18, 32, 0.8)" 
            stroke={color}
            strokeWidth="1"
        />
        <text 
        x={x} 
        y={y - 13} 
        fill={color} 
        fontSize={10} 
        fontWeight="bold" 
        textAnchor="middle"
        dominantBaseline="middle"
        >
        {displayValue}
        </text>
    </g>
  );
};

const GoalCard = ({ title, currentTotal, targetPercent, baseValue, onBaseChange, onTargetChange, colorClass }: any) => {
    // Calculate Reduction
    const reductionPercent = baseValue > 0 ? ((1 - (currentTotal / baseValue)) * 100) : 0;
    const isGoalMet = reductionPercent >= targetPercent;
    
    // Formatting
    const formatNum = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 0 });

    return (
        <div className="glass-panel p-5 rounded-2xl border border-white/5 relative overflow-hidden">
             <div className={`absolute top-0 right-0 p-2 opacity-10 ${colorClass}`}>
                 <Target size={80} />
             </div>
             
             <div className="relative z-10">
                <h4 className="text-white font-display font-bold text-lg mb-4 flex items-center gap-2">
                    {title}
                    {isGoalMet ? <CheckCircle className="text-green-400" size={20} /> : <XCircle className="text-red-400" size={20} />}
                </h4>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="text-xs text-textMuted uppercase font-bold block mb-1">Base Inicial (Horas)</label>
                        <div className="flex items-center bg-black/20 rounded-lg border border-white/10 px-2">
                            <input 
                                type="number" 
                                value={baseValue}
                                onChange={(e) => onBaseChange(parseFloat(e.target.value) || 0)}
                                className="w-full bg-transparent border-none text-white text-sm py-1.5 focus:ring-0 focus:outline-none"
                            />
                            <Settings size={12} className="text-textMuted ml-1" />
                        </div>
                    </div>
                    <div>
                         <label className="text-xs text-textMuted uppercase font-bold block mb-1">Meta Redução %</label>
                         <div className="flex items-center bg-black/20 rounded-lg border border-white/10 px-2">
                            <input 
                                type="number" 
                                value={targetPercent}
                                onChange={(e) => onTargetChange(parseFloat(e.target.value) || 0)}
                                className="w-full bg-transparent border-none text-white text-sm py-1.5 focus:ring-0 focus:outline-none"
                            />
                            <span className="text-textMuted text-xs">%</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-end justify-between border-t border-white/5 pt-4">
                    <div>
                        <div className="text-xs text-textMuted mb-1">Atual ({new Date().getFullYear()})</div>
                        <div className="text-2xl font-bold text-white">{formatNum(currentTotal)} h</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-textMuted mb-1">Redução Real</div>
                        <div className={`text-2xl font-bold ${isGoalMet ? 'text-green-400' : 'text-red-400'}`}>
                            {reductionPercent > 0 ? '-' : '+'}{Math.abs(reductionPercent).toFixed(1)}%
                        </div>
                    </div>
                </div>
                
                <div className="mt-2 text-xs text-center text-textMuted bg-white/5 py-1 rounded">
                    Status: <span className={isGoalMet ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                        {isGoalMet ? 'META BATIDA' : 'ABAIXO DA META'}
                    </span>
                </div>
             </div>
        </div>
    );
};

const CostTable = ({ data, onUpdateBranchSalary }: { data: DriverRecord[], onUpdateBranchSalary: (filial: string, val: number) => void }) => {
    const [editingBranch, setEditingBranch] = useState<{name: string, value: string} | null>(null);

    // Group by Branch
    const statsByBranch = useMemo(() => {
        const groups: Record<string, { totalSalary: number, count: number }> = {};
        
        data.forEach(d => {
            if (!groups[d.filial]) {
                groups[d.filial] = { totalSalary: 0, count: 0 };
            }
            // Use existing salary or default to 0
            if (d.baseSalary && d.baseSalary > 0) {
                 groups[d.filial].totalSalary += d.baseSalary;
                 groups[d.filial].count += 1;
            }
        });

        // Calculate averages
        return Object.keys(groups).map(filial => {
            const { totalSalary, count } = groups[filial];
            const avgSalary = count > 0 ? totalSalary / count : 0;
            const hourlyRate = avgSalary / 220;
            
            return {
                filial,
                avgSalary,
                val50: hourlyRate * 1.5,
                val100: hourlyRate * 2.0,
                valNight: hourlyRate * 0.2 // Adicional Noturno is usually 20% on top of normal hour
            };
        }).sort((a, b) => b.avgSalary - a.avgSalary);
    }, [data]);

    const formatBRL = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const handleStartEdit = (filial: string, currentAvg: number) => {
        setEditingBranch({ name: filial, value: currentAvg.toString() });
    };

    const handleSaveEdit = () => {
        if (!editingBranch) return;
        const num = parseFloat(editingBranch.value.replace(',', '.'));
        
        if (!isNaN(num) && num >= 0) {
            onUpdateBranchSalary(editingBranch.name, num);
            setEditingBranch(null);
        } else {
            alert("Valor inválido.");
        }
    };

    return (
        <div className="glass-panel p-6 rounded-2xl overflow-hidden relative">
            <h3 className="text-lg font-display font-bold text-white mb-4 flex items-center gap-2">
                <DollarSign className="text-primary" size={20}/>
                Matriz de Custos por Filial (Estimativa)
            </h3>
            <p className="text-xs text-textMuted mb-4">
                Valores calculados com base na média salarial informada de cada filial. (Divisor 220h).
                <br/>Clique no botão de editar para definir o salário de toda a filial (Cruzar dados).
            </p>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-primary/20 text-white">
                        <tr>
                            <th className="p-3 text-xs uppercase font-bold border border-white/10">Filial</th>
                            <th className="p-3 text-xs uppercase font-bold border border-white/10 text-right">Salário Base (Médio)</th>
                            <th className="p-3 text-xs uppercase font-bold border border-white/10 text-right text-primary">Valor 50% (Unit)</th>
                            <th className="p-3 text-xs uppercase font-bold border border-white/10 text-right text-secondary">Valor 100% (Unit)</th>
                            <th className="p-3 text-xs uppercase font-bold border border-white/10 text-right text-accent">Adc. Noturno (Unit)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {statsByBranch.map(row => (
                            <tr key={row.filial} className="hover:bg-white/5 transition-colors border-b border-white/5 group">
                                <td className="p-3 text-sm font-medium text-white border-l border-white/5">{row.filial}</td>
                                <td className="p-3 text-sm text-right text-textMuted border-l border-white/5 bg-white/5">
                                    <div className="flex items-center justify-end gap-2 group-hover:text-white transition-colors">
                                        {formatBRL(row.avgSalary)}
                                        <button 
                                            onClick={() => handleStartEdit(row.filial, row.avgSalary)}
                                            className="p-1.5 rounded-lg bg-primary/20 hover:bg-primary/40 text-primary transition-all opacity-0 group-hover:opacity-100 transform hover:scale-110"
                                            title="Editar Salário da Filial"
                                        >
                                            <Edit size={12} />
                                        </button>
                                    </div>
                                </td>
                                <td className="p-3 text-sm text-right font-mono text-primary font-bold border-l border-white/5">{formatBRL(row.val50)}</td>
                                <td className="p-3 text-sm text-right font-mono text-secondary font-bold border-l border-white/5">{formatBRL(row.val100)}</td>
                                <td className="p-3 text-sm text-right font-mono text-accent font-bold border-l border-white/5 border-r">{formatBRL(row.valNight)}</td>
                            </tr>
                        ))}
                        {statsByBranch.length === 0 && (
                            <tr><td colSpan={5} className="p-4 text-center text-textMuted">Nenhum dado salarial disponível.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* EDIT SALARY MODAL */}
            {editingBranch && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-surface border border-white/20 p-6 rounded-2xl shadow-2xl w-full max-w-sm transform scale-100 transition-all">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-white font-bold text-lg">Ajuste Salarial</h4>
                            <button onClick={() => setEditingBranch(null)} className="text-textMuted hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-xs text-textMuted uppercase font-bold mb-2">
                                Filial: <span className="text-white">{editingBranch.name}</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted">R$</span>
                                <input 
                                    type="number" 
                                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white font-mono focus:outline-none focus:border-primary"
                                    value={editingBranch.value}
                                    onChange={(e) => setEditingBranch({ ...editingBranch, value: e.target.value })}
                                    autoFocus
                                />
                            </div>
                            <p className="text-[10px] text-textMuted mt-2">
                                *Isso atualizará o Salário Base de <strong>todos</strong> os motoristas desta filial.
                            </p>
                        </div>
                        
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setEditingBranch(null)}
                                className="flex-1 py-2 rounded-lg border border-white/10 text-textMuted hover:bg-white/5 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleSaveEdit}
                                className="flex-1 py-2 rounded-lg bg-primary hover:bg-blue-600 text-white font-bold transition-colors flex items-center justify-center gap-2"
                            >
                                <Save size={16} /> Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ data, onUpdateBranchSalary }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  
  // Drill Down State
  const [drillDownOpen, setDrillDownOpen] = useState(false);
  const [drillDownTitle, setDrillDownTitle] = useState('');
  const [drillDownData, setDrillDownData] = useState<DriverRecord[]>([]);

  // Goals State
  const [goalsExpanded, setGoalsExpanded] = useState(true);
  const [raiaBase, setRaiaBase] = useState(11000);
  const [raiaTarget, setRaiaTarget] = useState(24);
  const [pauliniaBase, setPauliniaBase] = useState(5000); // Exemplo inicial
  const [pauliniaTarget, setPauliniaTarget] = useState(35);

  // Extract available months
  const availableMonths = useMemo(() => {
    const months = new Set(data.map(d => d.referenceDate).filter(Boolean));
    return Array.from(months).sort().reverse();
  }, [data]);

  // Filter Data
  const filteredData = useMemo(() => {
    if (selectedMonth === 'all') return data;
    return data.filter(d => d.referenceDate === selectedMonth);
  }, [data, selectedMonth]);

  const stats = useMemo<KPIStats>(() => {
    return filteredData.reduce((acc, curr) => ({
      totalHe50: acc.totalHe50 + curr.he50,
      totalHe100: acc.totalHe100 + curr.he100,
      totalNight: acc.totalNight + curr.adicionalNoturno,
      totalOvertime: acc.totalOvertime + curr.he50 + curr.he100,
      avgOvertime: 0, 
      totalDisplacement: acc.totalDisplacement + curr.deslocamento,
      totalAbsences: acc.totalAbsences + curr.faltas,
      costEstimate: acc.costEstimate + (curr.he50 * 1.5) + (curr.he100 * 2) // Rough estimate logic
    }), {
      totalHe50: 0, totalHe100: 0, totalNight: 0, totalOvertime: 0, 
      avgOvertime: 0, totalDisplacement: 0, totalAbsences: 0, costEstimate: 0
    });
  }, [filteredData]);
  
  if (filteredData.length > 0) {
    stats.avgOvertime = stats.totalOvertime / filteredData.length;
  }

  // Goal Data Calculation
  const goalsData = useMemo(() => {
      // Logic: Paulinia vs Raia (Everyone else)
      let currentRaia = 0;
      let currentPaulinia = 0;

      filteredData.forEach(d => {
          const totalHe = d.he50 + d.he100;
          const branch = d.filial ? d.filial.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";
          
          if (branch.includes('paulinia')) {
              currentPaulinia += totalHe;
          } else {
              currentRaia += totalHe;
          }
      });

      return { currentRaia, currentPaulinia };
  }, [filteredData]);


  const branchData = useMemo(() => {
    const map = new Map();
    filteredData.forEach(d => {
      const current = map.get(d.filial) || { name: d.filial, he50: 0, he100: 0 };
      current.he50 += d.he50;
      current.he100 += d.he100;
      map.set(d.filial, current);
    });
    return Array.from(map.values()).sort((a, b) => (b.he50 + b.he100) - (a.he50 + a.he100));
  }, [filteredData]);

  // Financial Chart Data (Cost by Branch)
  const branchCostData = useMemo(() => {
    const map = new Map();
    filteredData.forEach(d => {
        // Estimate Cost
        const salary = d.baseSalary || 0;
        const hourlyRate = salary > 0 ? salary / 220 : 0;
        const cost50 = hourlyRate * 1.5 * d.he50;
        const cost100 = hourlyRate * 2.0 * d.he100;
        const totalCost = cost50 + cost100;

        const current = map.get(d.filial) || { name: d.filial, totalCost: 0 };
        current.totalCost += totalCost;
        map.set(d.filial, current);
    });
    return Array.from(map.values()).sort((a, b) => b.totalCost - a.totalCost);
  }, [filteredData]);

  const evolutionData = useMemo(() => {
    const map = new Map();
    data.forEach(d => { 
        const dateKey = d.referenceDate || 'N/A';
        const current = map.get(dateKey) || { date: dateKey, he50: 0, he100: 0 };
        current.he50 += d.he50;
        current.he100 += d.he100;
        map.set(dateKey, current);
    });
    
    const sorted = Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));

    return sorted.map((item, index) => {
        const total = item.he50 + item.he100;
        let diff = 0;
        let hasPrev = false;

        if (index > 0) {
            const prev = sorted[index - 1];
            const prevTotal = prev.he50 + prev.he100;
            if (prevTotal > 0) {
                diff = ((total - prevTotal) / prevTotal) * 100;
            } else if (total > 0) {
                diff = 100; 
            }
            hasPrev = true;
        }

        return { ...item, diff, hasPrev, total };
    });
  }, [data]);

  const topDrivers = useMemo(() => {
    return [...filteredData]
      .sort((a, b) => (b.he50 + b.he100) - (a.he50 + a.he100))
      .slice(0, 10);
  }, [filteredData]);

  const pieData = [
    { name: 'HE 50%', value: stats.totalHe50, color: '#4DA3FF' },
    { name: 'HE 100%', value: stats.totalHe100, color: '#9B7CFF' },
    { name: 'Noturno', value: stats.totalNight, color: '#4DFFB2' },
  ];

  // --- Handlers for Chart Clicks ---

  const handleEvolutionClick = (dataPoint: any) => {
    if (!dataPoint || !dataPoint.activePayload) return;
    const clickedDate = dataPoint.activePayload[0].payload.date;
    
    // Filter drivers for this specific date
    const drivers = data.filter(d => d.referenceDate === clickedDate);
    
    setDrillDownTitle(`Período: ${clickedDate}`);
    setDrillDownData(drivers);
    setDrillDownOpen(true);
  };

  const handleBranchClick = (dataPoint: any) => {
    if (!dataPoint || !dataPoint.activePayload) return;
    const branchName = dataPoint.activePayload[0].payload.name;

    // Filter drivers for this branch, AND apply current month filter if active
    const drivers = filteredData.filter(d => d.filial === branchName);

    setDrillDownTitle(`Filial: ${branchName} ${selectedMonth !== 'all' ? `(${selectedMonth})` : ''}`);
    setDrillDownData(drivers);
    setDrillDownOpen(true);
  };

  const handleCostChartClick = (dataPoint: any) => {
    if (!dataPoint || !dataPoint.activePayload) return;
    const branchName = dataPoint.activePayload[0].payload.name;

    // Filter drivers for this branch
    const drivers = filteredData.filter(d => d.filial === branchName);

    setDrillDownTitle(`Custo: ${branchName} ${selectedMonth !== 'all' ? `(${selectedMonth})` : ''}`);
    setDrillDownData(drivers);
    setDrillDownOpen(true);
  };

  const handlePieClick = (dataPoint: any) => {
      // Pie chart returns data slightly differently in onClick
      if (!dataPoint) return;
      const typeName = dataPoint.name; // e.g., 'HE 50%'

      // Show all drivers in current filter, title indicating we are looking at distribution
      setDrillDownTitle(`Distribuição: ${typeName} ${selectedMonth !== 'all' ? `(${selectedMonth})` : ''}`);
      setDrillDownData(filteredData);
      setDrillDownOpen(true);
  };

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-textMuted">
        <Briefcase size={48} className="mb-4 opacity-50" />
        <h2 className="text-xl font-medium">Nenhum dado disponível</h2>
        <p className="mt-2 text-sm">Importe um CSV ou cole dados do Excel para começar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <DrillDownModal 
        isOpen={drillDownOpen} 
        onClose={() => setDrillDownOpen(false)} 
        title={drillDownTitle} 
        data={drillDownData} 
      />

      {/* FILTER BAR & HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-2xl font-display font-bold text-white">Dashboard Operacional</h1>
            <p className="text-textMuted text-sm">Visão consolidada de horas extras e custos</p>
        </div>
        
        <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={16} />
            <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-surface border border-white/10 rounded-xl py-2 pl-10 pr-8 text-sm text-white focus:outline-none focus:border-primary appearance-none cursor-pointer shadow-lg min-w-[200px]"
            >
                <option value="all">Todos os Meses (Consolidado)</option>
                {availableMonths.map(month => (
                    <option key={month} value={month}>{month}</option>
                ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-textMuted">
                <Calendar size={14} />
            </div>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total HE 50%" 
          value={stats.totalHe50.toLocaleString(undefined, { maximumFractionDigits: 1 })} 
          icon={Clock} 
          color="primary" 
          subtext="Hora Extra Padrão"
        />
        <KPICard 
          title="Total HE 100%" 
          value={stats.totalHe100.toLocaleString(undefined, { maximumFractionDigits: 1 })} 
          icon={TrendingUp} 
          color="secondary" 
          subtext="Fins de Semana/Feriados"
        />
        <KPICard 
          title="Adicional Noturno" 
          value={stats.totalNight.toLocaleString(undefined, { maximumFractionDigits: 1 })} 
          icon={Clock} 
          color="accent" 
          subtext="Horas Noturnas"
        />
        <KPICard 
          title="Total de Faltas" 
          value={stats.totalAbsences} 
          icon={AlertTriangle} 
          color="danger" 
          subtext="Não justificadas"
        />
      </div>

      {/* COST ANALYSIS TABLE */}
      <CostTable data={filteredData} onUpdateBranchSalary={onUpdateBranchSalary} />

      {/* NEW: FINANCIAL CHART */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col h-80">
        <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
                <BarChart3 className="text-green-400" size={24} />
                <h3 className="text-lg font-display font-bold text-white">Custo Total de Horas Extras (R$)</h3>
            </div>
            <span className="text-xs text-textMuted">Por Filial - Clique nas barras para ver detalhes</span>
        </div>
        <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={branchCostData} 
                margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                onClick={handleCostChartClick}
                className="cursor-pointer"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#B8C1EC" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis 
                    stroke="#B8C1EC" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val) => `R$${(val/1000).toFixed(0)}k`} 
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(77, 255, 178, 0.05)' }} />
                <Bar 
                    dataKey="totalCost" 
                    name="Valor Total R$" 
                    fill="#4DFFB2" 
                    radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* GOALS SECTION */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/10">
          <div 
             className="bg-surfaceHighlight/50 p-4 flex justify-between items-center cursor-pointer hover:bg-surfaceHighlight/70 transition-colors"
             onClick={() => setGoalsExpanded(!goalsExpanded)}
          >
              <div className="flex items-center gap-2">
                 <Target className="text-primary" size={20} />
                 <h3 className="font-display font-bold text-white">Metas de Redução de Custos</h3>
              </div>
              <div className="text-textMuted">
                  {goalsExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
          </div>
          
          {goalsExpanded && (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/20">
                  <GoalCard 
                      title="Meta RAIA (Exceto Paulínia)"
                      currentTotal={goalsData.currentRaia}
                      baseValue={raiaBase}
                      targetPercent={raiaTarget}
                      onBaseChange={setRaiaBase}
                      onTargetChange={setRaiaTarget}
                      colorClass="text-blue-500"
                  />
                  <GoalCard 
                      title="Meta PAULÍNIA (Filial Única)"
                      currentTotal={goalsData.currentPaulinia}
                      baseValue={pauliniaBase}
                      targetPercent={pauliniaTarget}
                      onBaseChange={setPauliniaBase}
                      onTargetChange={setPauliniaTarget}
                      colorClass="text-purple-500"
                  />
                  <div className="md:col-span-2 text-center text-xs text-textMuted mt-2">
                      <p>As metas comparam o volume de horas do filtro atual com o valor base informado manualmente.</p>
                  </div>
              </div>
          )}
      </div>

      {/* EVOLUTION CHART */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col h-80">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-display font-bold text-white">Evolução Mensal (Interativo)</h3>
            <span className="text-xs text-textMuted">Clique nos pontos para ver os motoristas</span>
        </div>
        <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                    data={evolutionData} 
                    margin={{ top: 20, right: 30, left: 10, bottom: 0 }}
                    onClick={handleEvolutionClick}
                    className="cursor-pointer"
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                        dataKey="date" 
                        stroke="#B8C1EC" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                        tickFormatter={(val) => {
                           if(val === 'N/A') return val;
                           const parts = val.split('-');
                           if(parts.length === 2) return `${parts[1]}/${parts[0]}`;
                           return val;
                        }}
                    />
                    <YAxis stroke="#B8C1EC" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />
                    <Line 
                        type="monotone" 
                        dataKey="he50" 
                        stroke="#4DA3FF" 
                        strokeWidth={3} 
                        dot={{r: 4, fill: '#4DA3FF', strokeWidth: 0}} 
                        activeDot={{r: 6, stroke: '#fff', strokeWidth: 2}} 
                        name="HE 50%" 
                        animationDuration={1000} 
                    />
                    <Line 
                        type="monotone" 
                        dataKey="he100" 
                        stroke="#9B7CFF" 
                        strokeWidth={3} 
                        dot={{r: 4, fill: '#9B7CFF', strokeWidth: 0}} 
                        activeDot={{r: 6, stroke: '#fff', strokeWidth: 2}} 
                        name="HE 100%" 
                        animationDuration={1000} 
                    >
                        <LabelList dataKey="diff" content={<CustomLabel />} />
                    </Line>
                </LineChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* BRANCH & PIE CHART ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
        {/* Main Bar Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col">
          <h3 className="text-lg font-display font-bold text-white mb-4">
             Horas Extras por Filial 
             <span className="ml-2 text-xs font-normal text-textMuted opacity-60">
                {selectedMonth === 'all' ? '(Todos os meses)' : `(${selectedMonth})`} - Clique na barra para detalhes
             </span>
          </h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={branchData} 
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                onClick={handleBranchClick}
                className="cursor-pointer"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#B8C1EC" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#B8C1EC" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="he50" stackId="a" fill="#4DA3FF" radius={[0, 0, 4, 4]} />
                <Bar dataKey="he100" stackId="a" fill="#9B7CFF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col">
          <h3 className="text-lg font-display font-bold text-white mb-4">Distribuição</h3>
          <div className="flex-1 w-full min-h-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart onClick={handlePieClick} className="cursor-pointer">
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                <span className="text-2xl font-bold text-white">{stats.totalOvertime.toFixed(0)}</span>
                <span className="text-xs text-textMuted uppercase">Total Horas</span>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2">
             {pieData.map(d => (
                 <div key={d.name} className="flex items-center justify-between text-sm">
                     <span className="flex items-center gap-2 text-textMuted">
                         <span className="w-3 h-3 rounded-full" style={{ background: d.color }}></span>
                         {d.name}
                     </span>
                     <span className="font-bold text-white">{d.value.toFixed(1)}</span>
                 </div>
             ))}
          </div>
        </div>
      </div>

      {/* TOP DRIVERS LIST */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-display font-bold text-white">
                Top 10 Motoristas (Mais HE)
                 <span className="ml-2 text-xs font-normal text-textMuted opacity-60">
                {selectedMonth === 'all' ? '(Todos os meses)' : `(${selectedMonth})`}
             </span>
            </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-textMuted text-xs uppercase tracking-wider border-b border-white/5">
                <th className="p-3 font-medium">Rank</th>
                <th className="p-3 font-medium">Motorista</th>
                <th className="p-3 font-medium">Filial</th>
                <th className="p-3 font-medium text-right text-primary">HE 50%</th>
                <th className="p-3 font-medium text-right text-secondary">HE 100%</th>
                <th className="p-3 font-medium text-right text-white">Total</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {topDrivers.map((driver, idx) => (
                <tr key={driver.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <td className="p-3 text-textMuted">#{idx + 1}</td>
                  <td className="p-3 font-medium text-white group-hover:text-primary transition-colors">{driver.nome}</td>
                  <td className="p-3 text-textMuted">{driver.filial}</td>
                  <td className="p-3 text-right text-primary font-mono">{driver.he50.toFixed(1)}</td>
                  <td className="p-3 text-right text-secondary font-mono">{driver.he100.toFixed(1)}</td>
                  <td className="p-3 text-right font-bold text-white font-mono">{(driver.he50 + driver.he100).toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;