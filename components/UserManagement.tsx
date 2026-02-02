import React, { useState } from 'react';
import { User } from '../types';
import { UserPlus, Trash2, Shield, User as UserIcon } from 'lucide-react';

interface UserManagementProps {
  users: User[];
  onAddUser: (user: User) => void;
  onDeleteUser: (username: string) => void;
  currentUser: string;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, onAddUser, onDeleteUser, currentUser }) => {
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) return;

    if (users.some(u => u.username === newUsername)) {
      alert("Usuário já existe!");
      return;
    }

    onAddUser({ username: newUsername, password: newPassword, role });
    setNewUsername('');
    setNewPassword('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* ADD USER FORM */}
      <div className="glass-panel p-8 rounded-2xl">
        <h2 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-2">
            <UserPlus className="text-primary" /> Adicionar Novo Usuário
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
             <div className="flex-1 w-full">
                <label className="block text-xs text-textMuted uppercase font-bold mb-2">Nome de Usuário</label>
                <input 
                    type="text" 
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full bg-background border border-white/10 rounded-xl p-3 text-white focus:border-primary focus:outline-none"
                    placeholder="Ex: gestor_rh"
                />
             </div>
             <div className="flex-1 w-full">
                <label className="block text-xs text-textMuted uppercase font-bold mb-2">Senha</label>
                <input 
                    type="text" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-background border border-white/10 rounded-xl p-3 text-white focus:border-primary focus:outline-none"
                    placeholder="Senha segura"
                />
             </div>
             <div className="w-full md:w-32">
                <label className="block text-xs text-textMuted uppercase font-bold mb-2">Função</label>
                <select 
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full bg-background border border-white/10 rounded-xl p-3 text-white focus:border-primary focus:outline-none"
                >
                    <option value="user">Usuário</option>
                    <option value="admin">Admin</option>
                </select>
             </div>
             <button 
                type="submit"
                className="w-full md:w-auto px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-blue-600 transition-colors"
             >
                Adicionar
             </button>
        </form>
      </div>

      {/* USER LIST */}
      <div className="glass-panel p-8 rounded-2xl">
        <h2 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-2">
            <UserIcon className="text-white" /> Usuários do Sistema
        </h2>
        <div className="overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-left">
                <thead className="bg-surfaceHighlight">
                    <tr>
                        <th className="p-4 text-xs font-bold text-textMuted uppercase">Usuário</th>
                        <th className="p-4 text-xs font-bold text-textMuted uppercase">Função</th>
                        <th className="p-4 text-xs font-bold text-textMuted uppercase text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {users.map(u => (
                        <tr key={u.username} className="bg-surface hover:bg-white/5 transition-colors">
                            <td className="p-4 text-white font-medium flex items-center gap-2">
                                {u.username}
                                {u.username === currentUser && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Você</span>}
                            </td>
                            <td className="p-4 text-textMuted flex items-center gap-1">
                                {u.role === 'admin' && <Shield size={14} className="text-secondary" />}
                                <span className={u.role === 'admin' ? 'text-secondary' : ''}>
                                    {u.role === 'admin' ? 'Administrador' : 'Usuário Padrão'}
                                </span>
                            </td>
                            <td className="p-4 text-right">
                                {u.username !== 'admin' && u.username !== currentUser && (
                                    <button 
                                        onClick={() => onDeleteUser(u.username)}
                                        className="p-2 text-textMuted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Remover usuário"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;