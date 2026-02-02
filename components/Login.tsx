import React, { useState } from 'react';
import { Lock, User, ArrowRight } from 'lucide-react';
import { User as UserType } from '../types';

interface LoginProps {
  users: UserType[];
  onLogin: (user: UserType) => void;
}

const Login: React.FC<LoginProps> = ({ users, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      onLogin(user);
    } else {
      setError('Usuário ou senha incorretos.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[0%] right-[0%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-md bg-surface border border-white/10 p-8 rounded-2xl shadow-2xl backdrop-blur-md relative z-10">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-white tracking-tight mb-2">
                NEXUS <span className="text-primary">OM</span>
            </h1>
            <p className="text-textMuted text-sm">Entre para acessar o painel de gestão</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
            <div>
                <label className="block text-xs font-bold text-textMuted uppercase mb-2">Usuário</label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
                    <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-background border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary transition-colors"
                        placeholder="admin"
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-textMuted uppercase mb-2">Senha</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-background border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary transition-colors"
                        placeholder="••••••"
                    />
                </div>
            </div>

            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg text-center">
                    {error}
                </div>
            )}

            <button 
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 text-white font-bold py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
                Entrar <ArrowRight size={18} />
            </button>
        </form>
        
        <div className="mt-8 text-center text-xs text-textMuted">
            &copy; {new Date().getFullYear()} Nexus Overtime Manager
        </div>
      </div>
    </div>
  );
};

export default Login;