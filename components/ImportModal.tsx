import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X, Calendar, Download } from 'lucide-react';
import { DriverRecord } from '../types';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: DriverRecord[]) => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [textData, setTextData] = useState('');
  const [referenceDate, setReferenceDate] = useState(new Date().toISOString().slice(0, 7)); // Default YYYY-MM
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const downloadTemplate = () => {
    const headers = [
      "NOME", 
      "ADIANTAMENTOS", 
      "DIARIAS MES", 
      "FILIAL", 
      "EMPRESA", 
      "CPF", 
      "DESLOCAMENTO", 
      "HE 50%", 
      "HE 100%", 
      "ADICIONAL NOTURNO", 
      "FALTAS",
      "SALARIO BASE"
    ];
    // Example row
    const example = [
      "JOAO SILVA", "150.00", "300.00", "SAO PAULO", "LOGISTICA BR", "123.456.789-00", "50.00", "10.5", "5.0", "20.0", "0", "2200.00"
    ];
    
    // Using tabs so it pastes perfectly into Excel
    const content = headers.join("\t") + "\n" + example.join("\t");
    
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "modelo_importacao_v2.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseData = () => {
    setError(null);
    if (!textData.trim()) {
      setError("Por favor, cole alguns dados primeiro.");
      return;
    }

    try {
      const rows = textData.trim().split('\n');
      const parsed: DriverRecord[] = [];

      rows.forEach((row, index) => {
        // Support Tab separated (Excel default) or Pipe separated
        const cols = row.includes('\t') ? row.split('\t') : row.split('|');
        
        // Skip header if it looks like the header
        if (index === 0 && (cols[0].toLowerCase().includes('nome') || cols[0].toLowerCase().includes('name'))) return;

        if (cols.length < 5) return; // Skip malformed rows

        const cleanNum = (val: string) => {
            if(!val) return 0;
            // Handle R$ and BRL formatting 1.000,00 -> 1000.00
            let clean = val.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
            return parseFloat(clean) || 0;
        };

        const record: DriverRecord = {
          id: crypto.randomUUID(),
          nome: cols[0]?.trim() || 'Desconhecido',
          adiantamentos: cleanNum(cols[1]),
          diariasMes: cleanNum(cols[2]),
          filial: cols[3]?.trim() || 'Geral',
          empresa: cols[4]?.trim() || 'Corp',
          cpf: cols[5]?.trim() || '000.000.000-00',
          deslocamento: cleanNum(cols[6]),
          he50: cleanNum(cols[7]),
          he100: cleanNum(cols[8]),
          adicionalNoturno: cleanNum(cols[9]),
          faltas: cleanNum(cols[10]),
          baseSalary: cleanNum(cols[11]), // New Column
          referenceDate: referenceDate,
        };
        parsed.push(record);
      });

      if (parsed.length === 0) {
        setError("Não foi possível processar linhas válidas. Verifique o formato.");
      } else {
        onImport(parsed);
        setTextData('');
        onClose();
      }
    } catch (e) {
      setError("Falha ao processar dados. Certifique-se de que correspondem ao formato solicitado.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-textMuted hover:text-white">
          <X size={24} />
        </button>

        <div className="flex justify-between items-start mb-2">
            <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <Upload className="text-primary" /> Importar Dados
            </h2>
            <button 
                onClick={downloadTemplate}
                className="flex items-center gap-1 text-xs bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg text-primary transition-colors"
            >
                <Download size={14} /> Baixar Modelo
            </button>
        </div>
        
        <p className="text-textMuted text-sm mb-6">
          Cole seus dados do Excel ou CSV abaixo e selecione o mês de referência.
          <br/>Recomendado incluir a coluna <strong>Salário Base</strong> no final.
        </p>

        <div className="mb-4">
            <label className="block text-textMuted text-xs uppercase font-bold mb-2 flex items-center gap-2">
                <Calendar size={14} /> Mês de Referência (Data da Importação)
            </label>
            <input 
                type="month" 
                value={referenceDate}
                onChange={(e) => setReferenceDate(e.target.value)}
                className="bg-background border border-white/10 rounded-lg p-2 text-white text-sm focus:border-primary focus:outline-none w-full md:w-1/2"
            />
        </div>

        <textarea
          className="w-full h-48 bg-background border border-white/10 rounded-xl p-4 text-sm text-textMain focus:outline-none focus:border-primary font-mono resize-none"
          placeholder="Cole as colunas aqui... (NOME | ADIANT. | DIARIAS | FILIAL | EMPRESA | CPF | DESLOC. | HE50 | HE100 | NOTURNO | FALTAS | SALARIO)"
          value={textData}
          onChange={(e) => setTextData(e.target.value)}
        />

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-textMuted hover:bg-white/5 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={parseData}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-primary to-blue-600 text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <CheckCircle size={18} /> Processar Dados
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;