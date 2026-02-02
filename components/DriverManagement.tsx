import React, { useState, useEffect, useRef } from 'react';
import { DriverRecord } from '../types';
import { Edit2, Trash2, Search, Download, Save, X, FileSpreadsheet, RotateCcw, UploadCloud, Database, Printer, Columns, Plus, Check } from 'lucide-react';

interface DriverManagementProps {
  data: DriverRecord[];
  onUpdate: (updatedRecord: DriverRecord) => void;
  onDelete: (id: string) => void;
  onExport: () => void;
  onPrint: () => void;
  onClearAll: () => void;
  onRestore: (newData: DriverRecord[]) => void;
  onAdd?: (newRecord: DriverRecord) => void; // Optional prop if we want to bubble up, but we can handle via parent data prop update logic usually
}

const DriverManagement: React.FC<DriverManagementProps> = ({ data, onUpdate, onDelete, onExport, onPrint, onClearAll, onRestore }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<DriverRecord | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  // Column Visibility State
  const [visibleColumns, setVisibleColumns] = useState({
    referenceDate: true,
    nome: true,
    filial: true,
    cpf: true,
    baseSalary: true,
    adiantamentos: true,
    diariasMes: true,
    deslocamento: true,
    he50: true,
    he100: true,
    adicionalNoturno: true,
    faltas: true
  });

  const filteredData = data.filter(d => 
    d.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.filial.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.cpf.includes(searchTerm)
  );

  const handleEditClick = (record: DriverRecord) => {
    setEditingId(record.id);
    setEditForm({ ...record });
  };

  const handleAddNew = () => {
    const newRecord: DriverRecord = {
        id: crypto.randomUUID(),
        nome: '',
        adiantamentos: 0,
        diariasMes: 0,
        filial: '',
        empresa: '',
        cpf: '',
        deslocamento: 0,
        he50: 0,
        he100: 0,
        adicionalNoturno: 0,
        faltas: 0,
        baseSalary: 0,
        referenceDate: new Date().toISOString().slice(0, 7)
    };
    onRestore([newRecord, ...data]);
    setEditingId(newRecord.id);
    setEditForm(newRecord);
  };

  const handleSave = () => {
    if (editForm) {
      onUpdate(editForm);
      setEditingId(null);
      setEditForm(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof DriverRecord) => {
    if (!editForm) return;
    const val = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
    setEditForm(prev => prev ? ({ ...prev, [field]: val }) : null);
  };

  const toggleColumn = (key: keyof typeof visibleColumns) => {
      setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleBackup = () => {
     if (data.length === 0) {
        alert("Sem dados para backup.");
        return;
     }
     
     const headers = ["ID", "DATA_REF", "NOME", "ADIANTAMENTOS", "DIARIAS_MES", "FILIAL", "EMPRESA", "CPF", "DESLOCAMENTO", "HE_50", "HE_100", "ADICIONAL_NOTURNO", "FALTAS", "SALARIO_BASE"];
     const rows = data.map(d => [
       d.id, d.referenceDate, d.nome, d.adiantamentos, d.diariasMes, d.filial, d.empresa, d.cpf, d.deslocamento, d.he50, d.he100, d.adicionalNoturno, d.faltas, d.baseSalary || 0
     ].join(","));
     
     const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.join("\n");
     const encodedUri = encodeURI(csvContent);
     const link = document.createElement("a");
     link.setAttribute("href", encodedUri);
     const date = new Date().toISOString().slice(0, 10);
     link.setAttribute("download", `backup_nexus_om_${date}.csv`);
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
  };

  const handleRestoreClick = () => {
     if (fileInputRef.current) {
        fileInputRef.current.click();
     }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file) return;

     const reader = new FileReader();
     reader.onload = (event) => {
        const text = event.target?.result as string;
        if (!text) return;

        try {
            const rows = text.trim().split('\n');
            const restoredData: DriverRecord[] = [];
            
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                if (!row.trim()) continue;
                
                const cols = row.split(',');
                if (cols.length < 13) continue;

                const record: DriverRecord = {
                    id: cols[0],
                    referenceDate: cols[1],
                    nome: cols[2],
                    adiantamentos: parseFloat(cols[3]) || 0,
                    diariasMes: parseFloat(cols[4]) || 0,
                    filial: cols[5],
                    empresa: cols[6],
                    cpf: cols[7],
                    deslocamento: parseFloat(cols[8]) || 0,
                    he50: parseFloat(cols[9]) || 0,
                    he100: parseFloat(cols[10]) || 0,
                    adicionalNoturno: parseFloat(cols[11]) || 0,
                    faltas: parseFloat(cols[12]) || 0,
                    baseSalary: parseFloat(cols[13]) || 0
                };
                restoredData.push(record);
            }

            if (restoredData.length > 0) {
                if (confirm(`Restaurar ${restoredData.length} registros? ISSO SUBSTITUIRÁ A BASE ATUAL.`)) {
                    onRestore(restoredData);
                    alert("Backup restaurado com sucesso!");
                }
            } else {
                alert("Nenhum dado válido encontrado no arquivo de backup.");
            }

        } catch (error) {
            alert("Erro ao processar arquivo de backup.");
        }
        
        e.target.value = '';
     };
     reader.readAsText(file);
  };

  // Helper to format currency
  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex flex-col xl:flex-row justify-between items-center gap-4">
        <div className="relative w-full xl:w-96 flex gap-2">
           <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
                <input 
                    type="text" 
                    placeholder="Buscar motorista, filial ou CPF..."
                    className="w-full bg-surface border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
           </div>
           
           <button 
             onClick={() => setShowColumnSelector(!showColumnSelector)}
             className="bg-surface border border-white/10 rounded-xl px-3 text-textMuted hover:text-white hover:bg-white/5 relative"
             title="Ocultar/Mostrar Colunas"
           >
              <Columns size={20} />
              {showColumnSelector && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-surface border border-white/10 rounded-xl shadow-2xl p-2 z-50 flex flex-col gap-1 max-h-64 overflow-y-auto">
                      {Object.keys(visibleColumns).map((key) => (
                          <button 
                            key={key}
                            onClick={() => toggleColumn(key as keyof typeof visibleColumns)}
                            className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/5 rounded text-xs text-left text-white"
                          >
                             <div className={`w-4 h-4 rounded border border-white/20 flex items-center justify-center ${visibleColumns[key as keyof typeof visibleColumns] ? 'bg-primary border-primary' : ''}`}>
                                 {visibleColumns[key as keyof typeof visibleColumns] && <Check size={10} />}
                             </div>
                             <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          </button>
                      ))}
                  </div>
              )}
           </button>
        </div>
        
        <div className="flex flex-wrap gap-2 justify-end">
             <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".csv" />

            <button 
                onClick={handleAddNew}
                className="flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/20 text-primary rounded-lg transition-all text-xs font-medium"
            >
                <Plus size={16} /> Novo Registro
            </button>

            <div className="w-px bg-white/10 mx-2"></div>

            <button onClick={handleRestoreClick} className="flex items-center gap-2 px-3 py-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 rounded-lg transition-all text-xs font-medium">
                <UploadCloud size={16} /> Restaurar
            </button>
            <button onClick={handleBackup} className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 rounded-lg transition-all text-xs font-medium">
                <Database size={16} /> Backup
            </button>
            
            <button onClick={onClearAll} className="flex items-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg transition-all text-xs font-medium">
                <RotateCcw size={16} /> Limpar Relatório
            </button>
            
            <button onClick={onPrint} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg transition-all shadow-lg active:scale-95 text-xs font-medium">
                <Printer size={16} /> Imprimir / PDF
            </button>
            
            <button onClick={onExport} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-lg transition-all shadow-lg active:scale-95 text-xs font-medium">
                <FileSpreadsheet size={16} /> Exportar Excel
            </button>
        </div>
      </div>

      <div className="flex-1 bg-surface border border-white/10 rounded-2xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[1600px]">
            <thead className="bg-surfaceHighlight/50 sticky top-0 z-10">
              <tr className="text-textMuted text-xs uppercase tracking-wider font-bold">
                {visibleColumns.referenceDate && <th className="p-4 border-b border-white/10">Mês Ref.</th>}
                {visibleColumns.nome && <th className="p-4 border-b border-white/10">Nome</th>}
                {visibleColumns.filial && <th className="p-4 border-b border-white/10">Filial</th>}
                {visibleColumns.baseSalary && <th className="p-4 border-b border-white/10 text-white font-extrabold bg-white/5">Salário Base</th>}
                {visibleColumns.cpf && <th className="p-4 border-b border-white/10">CPF</th>}
                
                {visibleColumns.adiantamentos && <th className="p-4 border-b border-white/10 text-right text-yellow-400">Adiant. (R$)</th>}
                {visibleColumns.diariasMes && <th className="p-4 border-b border-white/10 text-right text-yellow-400">Diárias (R$)</th>}
                {visibleColumns.deslocamento && <th className="p-4 border-b border-white/10 text-right text-yellow-400">Desloc.</th>}

                {visibleColumns.he50 && <th className="p-4 border-b border-white/10 text-right text-primary">HE 50%</th>}
                {visibleColumns.he100 && <th className="p-4 border-b border-white/10 text-right text-secondary">HE 100%</th>}
                {visibleColumns.adicionalNoturno && <th className="p-4 border-b border-white/10 text-right text-accent">Noturno</th>}
                {visibleColumns.faltas && <th className="p-4 border-b border-white/10 text-right text-danger">Faltas</th>}
                <th className="p-4 border-b border-white/10 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {filteredData.map((row) => (
                <tr key={row.id} className="hover:bg-white/5 transition-colors group">
                   {editingId === row.id && editForm ? (
                     <>
                        {visibleColumns.referenceDate && <td className="p-2"><input type="month" className="w-full bg-black/30 border border-white/20 rounded p-1 text-white" value={editForm.referenceDate} onChange={e => handleChange(e, 'referenceDate')} /></td>}
                        {visibleColumns.nome && <td className="p-2"><input className="w-full bg-black/30 border border-white/20 rounded p-1 text-white" value={editForm.nome} onChange={e => handleChange(e, 'nome')} /></td>}
                        {visibleColumns.filial && <td className="p-2"><input className="w-full bg-black/30 border border-white/20 rounded p-1 text-white" value={editForm.filial} onChange={e => handleChange(e, 'filial')} /></td>}
                        {visibleColumns.baseSalary && <td className="p-2"><input type="number" step="0.01" className="w-full bg-black/30 border border-white/20 rounded p-1 text-white font-bold" value={editForm.baseSalary} onChange={e => handleChange(e, 'baseSalary')} /></td>}
                        {visibleColumns.cpf && <td className="p-2"><input className="w-full bg-black/30 border border-white/20 rounded p-1 text-white" value={editForm.cpf} onChange={e => handleChange(e, 'cpf')} /></td>}
                        
                        {visibleColumns.adiantamentos && <td className="p-2"><input type="number" step="0.01" className="w-full bg-black/30 border border-white/20 rounded p-1 text-white text-right" value={editForm.adiantamentos} onChange={e => handleChange(e, 'adiantamentos')} /></td>}
                        {visibleColumns.diariasMes && <td className="p-2"><input type="number" step="0.01" className="w-full bg-black/30 border border-white/20 rounded p-1 text-white text-right" value={editForm.diariasMes} onChange={e => handleChange(e, 'diariasMes')} /></td>}
                        {visibleColumns.deslocamento && <td className="p-2"><input type="number" step="1" className="w-full bg-black/30 border border-white/20 rounded p-1 text-white text-right" value={editForm.deslocamento} onChange={e => handleChange(e, 'deslocamento')} /></td>}
                        
                        {visibleColumns.he50 && <td className="p-2"><input type="number" className="w-full bg-black/30 border border-white/20 rounded p-1 text-white text-right" value={editForm.he50} onChange={e => handleChange(e, 'he50')} /></td>}
                        {visibleColumns.he100 && <td className="p-2"><input type="number" className="w-full bg-black/30 border border-white/20 rounded p-1 text-white text-right" value={editForm.he100} onChange={e => handleChange(e, 'he100')} /></td>}
                        {visibleColumns.adicionalNoturno && <td className="p-2"><input type="number" className="w-full bg-black/30 border border-white/20 rounded p-1 text-white text-right" value={editForm.adicionalNoturno} onChange={e => handleChange(e, 'adicionalNoturno')} /></td>}
                        {visibleColumns.faltas && <td className="p-2"><input type="number" className="w-full bg-black/30 border border-white/20 rounded p-1 text-white text-right" value={editForm.faltas} onChange={e => handleChange(e, 'faltas')} /></td>}
                        
                        <td className="p-2 flex items-center justify-center gap-2">
                            <button onClick={handleSave} className="p-1.5 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30"><Save size={16} /></button>
                            <button onClick={handleCancel} className="p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"><X size={16} /></button>
                        </td>
                     </>
                   ) : (
                     <>
                        {visibleColumns.referenceDate && <td className="p-4 text-textMuted">{row.referenceDate}</td>}
                        {visibleColumns.nome && <td className="p-4 font-medium text-white">{row.nome}</td>}
                        {visibleColumns.filial && <td className="p-4 text-textMuted">{row.filial}</td>}
                        {visibleColumns.baseSalary && <td className="p-4 font-mono font-bold text-white bg-white/5">{formatCurrency(row.baseSalary || 0)}</td>}
                        {visibleColumns.cpf && <td className="p-4 text-textMuted">{row.cpf}</td>}
                        
                        {visibleColumns.adiantamentos && <td className="p-4 text-right font-mono text-textMuted">{formatCurrency(row.adiantamentos)}</td>}
                        {visibleColumns.diariasMes && <td className="p-4 text-right font-mono text-textMuted">{formatCurrency(row.diariasMes)}</td>}
                        {visibleColumns.deslocamento && <td className="p-4 text-right font-mono text-textMuted">{row.deslocamento.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</td>}

                        {visibleColumns.he50 && <td className="p-4 text-right font-mono text-primary">{row.he50}</td>}
                        {visibleColumns.he100 && <td className="p-4 text-right font-mono text-secondary">{row.he100}</td>}
                        {visibleColumns.adicionalNoturno && <td className="p-4 text-right font-mono text-accent">{row.adicionalNoturno}</td>}
                        {visibleColumns.faltas && <td className="p-4 text-right font-mono text-danger">{row.faltas}</td>}
                        
                        <td className="p-4 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEditClick(row)} className="p-1.5 hover:bg-white/10 rounded text-textMuted hover:text-white" title="Editar">
                                <Edit2 size={16} />
                            </button>
                            <button onClick={() => onDelete(row.id)} className="p-1.5 hover:bg-red-500/20 rounded text-textMuted hover:text-red-400" title="Excluir">
                                <Trash2 size={16} />
                            </button>
                        </td>
                     </>
                   )}
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={13} className="p-8 text-center text-textMuted">Nenhum registro encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-white/10 bg-surfaceHighlight/30 text-xs text-textMuted flex justify-between">
           <span>Mostrando {filteredData.length} registros</span>
           <span>Role para ver mais</span>
        </div>
      </div>
    </div>
  );
};

export default DriverManagement;