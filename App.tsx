import React, { useState } from 'react';
import { LayoutDashboard, Users, Image as ImageIcon, MessageSquare, PlusCircle, LogOut, TableProperties, ShieldCheck } from 'lucide-react';
import Dashboard from './components/Dashboard';
import ImportModal from './components/ImportModal';
import AIChat from './components/AIChat';
import ImageStudio from './components/ImageStudio';
import DriverManagement from './components/DriverManagement';
import Login from './components/Login';
import UserManagement from './components/UserManagement';
import { DriverRecord, User } from './types';

const App = () => {
  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userList, setUserList] = useState<User[]>([
    { username: 'admin', password: '123', role: 'admin' } // Default as requested (admin / 12345 but simplified here for demo, prompt said 12345 so updating)
  ]);
  
  // App State
  const [activeView, setActiveView] = useState<'dashboard' | 'chat' | 'studio' | 'management' | 'users'>('dashboard');
  const [data, setData] = useState<DriverRecord[]>([]);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);

  // Initialize admin with correct password if not done
  if (userList[0].password !== '12345') {
      const newList = [...userList];
      newList[0].password = '12345';
      setUserList(newList);
  }

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setActiveView('dashboard');
  };

  // Import Handler with Duplicate Check
  const handleImportData = (newData: DriverRecord[]) => {
    // Filter out duplicates based on CPF and Reference Date
    const uniqueRecords = newData.filter(newRecord => {
        const exists = data.some(existing => 
            existing.cpf === newRecord.cpf && 
            existing.referenceDate === newRecord.referenceDate
        );
        return !exists;
    });

    const duplicatesCount = newData.length - uniqueRecords.length;

    if (uniqueRecords.length > 0) {
        setData(prev => [...prev, ...uniqueRecords]);
        if (duplicatesCount > 0) {
            alert(`Importado com sucesso! ${duplicatesCount} registros duplicados (CPF + Mês) foram ignorados.`);
        }
    } else if (duplicatesCount > 0) {
        alert("Todos os registros importados já existem na base de dados (Duplicatas de CPF + Mês).");
    }
  };

  // Handlers for Data Management
  const handleUpdateDriver = (updatedRecord: DriverRecord) => {
    setData(prev => prev.map(item => item.id === updatedRecord.id ? updatedRecord : item));
  };

  const handleDeleteDriver = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este registro?")) {
      setData(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleClearAllData = () => {
      if (confirm("ATENÇÃO: Isso apagará TODOS os dados do sistema. Esta ação não pode ser desfeita. Deseja continuar?")) {
          setData([]);
      }
  };

  const handleRestoreData = (newData: DriverRecord[]) => {
      setData(newData);
  };

  // New Handler: Bulk Update Salary by Branch
  const handleUpdateBranchSalary = (filial: string, newSalary: number) => {
      // Logic handled in UI, this just commits the data
      setData(prev => prev.map(record => {
          if (record.filial === filial) {
              return { ...record, baseSalary: newSalary };
          }
          return record;
      }));
  };

  // Handlers for User Management
  const handleAddUser = (newUser: User) => {
    setUserList(prev => [...prev, newUser]);
  };

  const handleDeleteUser = (username: string) => {
    if (confirm(`Excluir usuário ${username}?`)) {
        setUserList(prev => prev.filter(u => u.username !== username));
    }
  };

  const handleExportCSV = () => {
    if (data.length === 0) {
      alert("Sem dados para exportar.");
      return;
    }
    
    // Using semicolon for Excel compatibility in regions like Brazil
    const headers = ["ID", "DATA_REF", "NOME", "ADIANTAMENTOS", "DIARIAS_MES", "FILIAL", "EMPRESA", "CPF", "DESLOCAMENTO", "HE_50", "HE_100", "ADICIONAL_NOTURNO", "FALTAS"];
    const rows = data.map(d => [
      d.id, 
      d.referenceDate, 
      d.nome, 
      d.adiantamentos.toString().replace('.', ','), 
      d.diariasMes.toString().replace('.', ','), 
      d.filial, 
      d.empresa, 
      d.cpf, 
      d.deslocamento.toString().replace('.', ','), 
      d.he50.toString().replace('.', ','), 
      d.he100.toString().replace('.', ','), 
      d.adicionalNoturno.toString().replace('.', ','), 
      d.faltas.toString().replace('.', ',')
    ].join(";"));
    
    // Add BOM for proper UTF-8 handling in Excel
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers.join(";") + "\n" + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "relatorio_horas_extras.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReport = () => {
      if (data.length === 0) {
        alert("Sem dados para gerar relatório.");
        return;
      }
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const logoHtml = logo ? `<img src="${logo}" style="height: 60px; margin-bottom: 20px;" />` : `<h1 style="color: #4DA3FF;">NEXUS OM</h1>`;
      
      // Group data by Company
      const companies = Array.from(new Set(data.map(d => d.empresa))).sort();

      let contentHtml = '';

      companies.forEach(company => {
          const companyData = data.filter(d => d.empresa === company);
          const totalDesloc = companyData.reduce((acc, d) => acc + d.deslocamento, 0);
          const totalHe50 = companyData.reduce((acc, d) => acc + d.he50, 0);
          const totalHe100 = companyData.reduce((acc, d) => acc + d.he100, 0);
          const totalNight = companyData.reduce((acc, d) => acc + d.adicionalNoturno, 0);
          const totalFaltas = companyData.reduce((acc, d) => acc + d.faltas, 0);

          contentHtml += `
            <div style="page-break-inside: avoid; margin-top: 30px;">
                <div style="background-color: #f0f4f8; padding: 10px; border-left: 5px solid #4DA3FF; margin-bottom: 10px;">
                    <h3 style="margin: 0; color: #1A1F36; text-transform: uppercase;">Empresa: ${company || 'N/A'}</h3>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Filial</th>
                            <th>CPF</th>
                            <th>Mês Ref.</th>
                            <th style="text-align: right;">Deslocamento</th>
                            <th style="text-align: right;">HE 50%</th>
                            <th style="text-align: right;">HE 100%</th>
                            <th style="text-align: right;">Noturno</th>
                            <th style="text-align: right;">Faltas</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${companyData.map(d => `
                            <tr>
                                <td>${d.nome}</td>
                                <td>${d.filial}</td>
                                <td>${d.cpf}</td>
                                <td>${d.referenceDate}</td>
                                <td style="text-align: right;">${d.deslocamento.toLocaleString('pt-BR', {minimumFractionDigits: 0, maximumFractionDigits: 0})}</td>
                                <td style="text-align: right;">${d.he50.toLocaleString('pt-BR')}</td>
                                <td style="text-align: right;">${d.he100.toLocaleString('pt-BR')}</td>
                                <td style="text-align: right;">${d.adicionalNoturno.toLocaleString('pt-BR')}</td>
                                <td style="text-align: right; color: ${d.faltas > 0 ? 'red' : 'inherit'};">${d.faltas}</td>
                            </tr>
                        `).join('')}
                        <tr style="background-color: #e6eaf0; font-weight: bold;">
                            <td colspan="4" style="text-align: right;">Subtotal ${company}:</td>
                            <td style="text-align: right;">${totalDesloc.toLocaleString('pt-BR', {minimumFractionDigits: 0, maximumFractionDigits: 0})}</td>
                            <td style="text-align: right;">${totalHe50.toLocaleString('pt-BR', {maximumFractionDigits: 1})}</td>
                            <td style="text-align: right;">${totalHe100.toLocaleString('pt-BR', {maximumFractionDigits: 1})}</td>
                            <td style="text-align: right;">${totalNight.toLocaleString('pt-BR', {maximumFractionDigits: 1})}</td>
                            <td style="text-align: right;">${totalFaltas}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
          `;
      });
      
      const html = `
          <html>
          <head>
              <title>Relatório Gerencial - Nexus OM</title>
              <style>
                  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
                  table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 20px; }
                  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                  th { background-color: #1A1F36; color: white; text-transform: uppercase; }
                  tr:nth-child(even) { background-color: #f9f9f9; }
                  .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
                  .footer { margin-top: 30px; font-size: 10px; text-align: center; color: #888; border-top: 1px solid #eee; padding-top: 10px; }
                  .kpi-row { display: flex; justify-content: space-between; margin-bottom: 30px; gap: 20px; }
                  .kpi-box { flex: 1; background: #f5f6fa; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #e0e0e0; }
                  .kpi-title { font-size: 12px; color: #666; text-transform: uppercase; margin-bottom: 5px; }
                  .kpi-value { font-size: 20px; font-weight: bold; color: #1A1F36; }
                  @media print {
                    .kpi-row { page-break-inside: avoid; }
                    h3 { page-break-after: avoid; }
                    thead { display: table-header-group; } 
                  }
              </style>
          </head>
          <body>
              <div class="header">
                  ${logoHtml}
                  <h2 style="margin: 0;">Relatório Gerencial de Horas Extras</h2>
                  <p style="margin: 5px 0 0 0; color: #666;">Gerado em: ${new Date().toLocaleString()}</p>
              </div>

              <!-- Global KPIs -->
              <div class="kpi-row">
                  <div class="kpi-box">
                      <div class="kpi-title">Total Geral Registros</div>
                      <div class="kpi-value">${data.length}</div>
                  </div>
                  <div class="kpi-box">
                      <div class="kpi-title">Total Geral HE 50%</div>
                      <div class="kpi-value">${data.reduce((acc, d) => acc + d.he50, 0).toLocaleString('pt-BR', {maximumFractionDigits: 1})}</div>
                  </div>
                  <div class="kpi-box">
                      <div class="kpi-title">Total Geral HE 100%</div>
                      <div class="kpi-value">${data.reduce((acc, d) => acc + d.he100, 0).toLocaleString('pt-BR', {maximumFractionDigits: 1})}</div>
                  </div>
                  <div class="kpi-box">
                      <div class="kpi-title">Total Geral Deslocamento</div>
                      <div class="kpi-value">${data.reduce((acc, d) => acc + d.deslocamento, 0).toLocaleString('pt-BR', {minimumFractionDigits: 0, maximumFractionDigits: 0})}</div>
                  </div>
              </div>

              ${contentHtml}

              <div class="footer">
                  Relatório gerado pelo sistema Nexus Overtime Manager (Nexus OM).
              </div>

              <script>
                  window.onload = function() { window.print(); }
              </script>
          </body>
          </html>
      `;
      printWindow.document.write(html);
      printWindow.document.close();
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setLogo(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isLoggedIn) {
      return <Login users={userList} onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-background text-textMain font-sans overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-64 bg-surface border-r border-white/5 flex flex-col z-20 shadow-2xl">
        <div className="p-6 border-b border-white/5 relative group cursor-pointer">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleLogoUpload} 
              className="absolute inset-0 opacity-0 z-10 cursor-pointer"
              title="Clique para enviar logo"
            />
            {logo ? (
              <img src={logo} alt="Logo Empresa" className="h-10 object-contain mx-auto" />
            ) : (
              <h1 className="text-2xl font-display font-bold text-white tracking-tight">
                NEXUS <span className="text-primary">OM</span>
              </h1>
            )}
            <p className="text-xs text-textMuted mt-1">Gestão de Horas Extras v2.1</p>
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-white pointer-events-none transition-opacity">
               Alterar Logo
            </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
            <button 
                onClick={() => setActiveView('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeView === 'dashboard' ? 'bg-primary/10 text-primary border border-primary/20 shadow-glow' : 'text-textMuted hover:text-white hover:bg-white/5'}`}
            >
                <LayoutDashboard size={20} />
                <span className="font-medium">Painel Geral</span>
            </button>
            <button 
                onClick={() => setActiveView('management')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeView === 'management' ? 'bg-green-500/10 text-green-400 border border-green-500/20 shadow-glow' : 'text-textMuted hover:text-white hover:bg-white/5'}`}
            >
                <TableProperties size={20} />
                <span className="font-medium">Gestão & Dados</span>
            </button>
            <button 
                onClick={() => setActiveView('chat')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeView === 'chat' ? 'bg-secondary/10 text-secondary border border-secondary/20 shadow-glow' : 'text-textMuted hover:text-white hover:bg-white/5'}`}
            >
                <MessageSquare size={20} />
                <span className="font-medium">Chat IA & Mapas</span>
            </button>
            <button 
                onClick={() => setActiveView('studio')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeView === 'studio' ? 'bg-accent/10 text-accent border border-accent/20 shadow-glow' : 'text-textMuted hover:text-white hover:bg-white/5'}`}
            >
                <ImageIcon size={20} />
                <span className="font-medium">Estúdio Criativo</span>
            </button>
            
            {currentUser?.role === 'admin' && (
                <button 
                    onClick={() => setActiveView('users')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeView === 'users' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-glow' : 'text-textMuted hover:text-white hover:bg-white/5'}`}
                >
                    <ShieldCheck size={20} />
                    <span className="font-medium">Usuários</span>
                </button>
            )}
        </nav>

        <div className="p-4 border-t border-white/5">
             <button 
                onClick={handleLogout}
                className="w-full mb-4 flex items-center justify-center gap-2 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-medium"
            >
                <LogOut size={16} /> Sair
            </button>

            <div className="glass-panel p-4 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center font-bold text-white uppercase">
                    {currentUser?.username.substring(0, 2)}
                </div>
                <div>
                    <div className="text-sm font-bold text-white capitalize">{currentUser?.username}</div>
                    <div className="text-xs text-textMuted capitalize">{currentUser?.role === 'admin' ? 'Administrador' : 'Colaborador'}</div>
                </div>
            </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* TOP BAR */}
        <header className="h-16 border-b border-white/5 bg-surface/50 backdrop-blur flex justify-between items-center px-8 z-10">
            <div className="flex items-center gap-4">
                <h2 className="text-xl font-display font-semibold text-white">
                    {activeView === 'dashboard' && 'Visão Executiva'}
                    {activeView === 'management' && 'Gestão de Motoristas'}
                    {activeView === 'chat' && 'Assistente Inteligente'}
                    {activeView === 'studio' && 'Estúdio Criativo'}
                    {activeView === 'users' && 'Gestão de Usuários'}
                </h2>
                <div className="h-6 w-px bg-white/10"></div>
                <div className="text-sm text-textMuted">
                    {data.length} Registros Carregados
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setIsImportOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition-all hover:scale-105 active:scale-95"
                >
                    <PlusCircle size={16} className="text-primary"/> Importar Dados
                </button>
            </div>
        </header>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-8 relative">
             {/* Background ambient glow */}
             <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[0%] left-[0%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[100px]"></div>
             </div>

             {activeView === 'dashboard' && (
                 <Dashboard 
                    data={data} 
                    onUpdateBranchSalary={handleUpdateBranchSalary} 
                 />
             )}
             
             {activeView === 'management' && (
               <DriverManagement 
                 data={data} 
                 onUpdate={handleUpdateDriver} 
                 onDelete={handleDeleteDriver}
                 onExport={handleExportCSV}
                 onPrint={handlePrintReport}
                 onClearAll={handleClearAllData}
                 onRestore={handleRestoreData}
               />
             )}

             {activeView === 'chat' && (
                 <div className="max-w-4xl mx-auto h-[calc(100vh-160px)]">
                     <AIChat data={data} />
                 </div>
             )}
             {activeView === 'studio' && <ImageStudio />}

             {activeView === 'users' && (
                 <UserManagement 
                    users={userList} 
                    onAddUser={handleAddUser} 
                    onDeleteUser={handleDeleteUser}
                    currentUser={currentUser?.username || ''}
                 />
             )}
        </div>
      </main>

      <ImportModal 
        isOpen={isImportOpen} 
        onClose={() => setIsImportOpen(false)} 
        onImport={handleImportData} 
      />
    </div>
  );
};

export default App;