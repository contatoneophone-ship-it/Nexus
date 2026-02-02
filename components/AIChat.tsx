import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, MapPin, Loader2 } from 'lucide-react';
import { chatWithData } from '../services/geminiService';
import { DriverRecord, ChatMessage } from '../types';

interface AIChatProps {
  data: DriverRecord[];
}

const AIChat: React.FC<AIChatProps> = ({ data }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Olá! Analisei seus dados de motoristas. Pergunte-me qualquer coisa sobre tendências de horas extras, custos ou filiais específicas.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'standard' | 'maps'>('standard');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setLoading(true);
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);

    // Prepare context
    const dataContext = JSON.stringify(data.slice(0, 100)); // Limit context size

    // Format history for API
    const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
    }));

    const responseText = await chatWithData(history, userMsg, dataContext, mode === 'maps');

    setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-surface border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-surfaceHighlight/50 backdrop-blur flex justify-between items-center">
            <div className="flex items-center gap-2">
                <Sparkles className="text-secondary" size={20} />
                <h3 className="font-display font-bold text-white">Assistente IA</h3>
            </div>
            <div className="flex gap-2">
                 <button 
                    onClick={() => setMode('standard')}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${mode === 'standard' ? 'bg-primary/20 border-primary text-primary' : 'border-white/10 text-textMuted hover:bg-white/5'}`}
                 >
                    Análise
                 </button>
                 <button 
                    onClick={() => setMode('maps')}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors flex items-center gap-1 ${mode === 'maps' ? 'bg-accent/20 border-accent text-accent' : 'border-white/10 text-textMuted hover:bg-white/5'}`}
                 >
                    <MapPin size={12}/> Locais
                 </button>
            </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary' : 'bg-secondary'}`}>
                        {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`p-3 rounded-2xl max-w-[80%] text-sm leading-relaxed ${
                        msg.role === 'user' 
                        ? 'bg-primary/20 text-white rounded-tr-none' 
                        : 'bg-white/5 text-textMuted rounded-tl-none border border-white/5'
                    }`}>
                        {msg.text.split('\n').map((line, i) => (
                            <p key={i} className="mb-1 last:mb-0">{line}</p>
                        ))}
                    </div>
                </div>
            ))}
            {loading && (
                <div className="flex gap-3">
                     <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                        <Loader2 size={16} className="animate-spin"/>
                    </div>
                    <div className="p-3 bg-white/5 rounded-2xl rounded-tl-none border border-white/5">
                        <span className="text-xs text-textMuted animate-pulse">Pensando...</span>
                    </div>
                </div>
            )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/10 bg-surfaceHighlight/30">
            <div className="relative">
                <input 
                    type="text" 
                    className="w-full bg-background border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-primary placeholder-textMuted/50"
                    placeholder={mode === 'maps' ? "Pergunte sobre locais das filiais..." : "Pergunte sobre insights..."}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button 
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="absolute right-2 top-2 p-1.5 bg-primary text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                >
                    <Send size={16} />
                </button>
            </div>
        </div>
    </div>
  );
};

export default AIChat;