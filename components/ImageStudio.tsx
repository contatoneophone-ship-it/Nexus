import React, { useState } from 'react';
import { Image, Wand2, Upload, Download, RefreshCw, Layers } from 'lucide-react';
import { generateImage, editImage } from '../services/geminiService';
import { AspectRatio } from '../types';

const ImageStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generate' | 'edit'>('generate');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  
  // Gen State
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");

  // Edit State
  const [sourceImage, setSourceImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResultImage(null);
    try {
        const img = await generateImage(prompt, aspectRatio);
        if (img) setResultImage(img);
    } catch (e) {
        alert("Falha ao gerar imagem");
    } finally {
        setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!prompt.trim() || !sourceImage) return;
    setLoading(true);
    setResultImage(null);
    try {
        const img = await editImage(sourceImage, prompt);
        if (img) setResultImage(img);
    } catch (e) {
        alert("Falha ao editar imagem");
    } finally {
        setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (end) => {
            setSourceImage(end.target?.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex gap-4 border-b border-white/10 pb-4">
        <button 
            onClick={() => setActiveTab('generate')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === 'generate' ? 'bg-primary text-white' : 'text-textMuted hover:bg-white/5'}`}
        >
            <Wand2 size={18} /> Gerar (Pro)
        </button>
        <button 
            onClick={() => setActiveTab('edit')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === 'edit' ? 'bg-secondary text-white' : 'text-textMuted hover:bg-white/5'}`}
        >
            <Image size={18} /> Editar (Nano Banana)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Controls */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-6">
            <div>
                <label className="block text-textMuted text-xs uppercase font-bold mb-2">Prompt</label>
                <textarea 
                    className="w-full bg-background border border-white/10 rounded-xl p-3 text-white text-sm focus:border-primary focus:outline-none resize-none h-32"
                    placeholder={activeTab === 'generate' ? "Um caminhão futurista dirigindo numa rodovia neon..." : "Adicione um filtro retrô, remova o fundo..."}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                />
            </div>

            {activeTab === 'generate' && (
                <div>
                     <label className="block text-textMuted text-xs uppercase font-bold mb-2">Proporção</label>
                     <div className="grid grid-cols-3 gap-2">
                        {["1:1", "3:4", "4:3", "9:16", "16:9"].map(r => (
                            <button 
                                key={r}
                                onClick={() => setAspectRatio(r as AspectRatio)}
                                className={`py-2 text-xs rounded border ${aspectRatio === r ? 'border-primary bg-primary/20 text-white' : 'border-white/10 text-textMuted'}`}
                            >
                                {r}
                            </button>
                        ))}
                     </div>
                </div>
            )}

            {activeTab === 'edit' && (
                <div>
                    <label className="block text-textMuted text-xs uppercase font-bold mb-2">Imagem de Origem</label>
                    <div className="relative group">
                         {sourceImage ? (
                             <img src={sourceImage} alt="Source" className="w-full h-40 object-cover rounded-lg border border-white/10" />
                         ) : (
                             <div className="w-full h-40 border-2 border-dashed border-white/10 rounded-lg flex items-center justify-center text-textMuted">
                                 Nenhuma imagem selecionada
                             </div>
                         )}
                         <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} accept="image/*" />
                         <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-lg">
                            <span className="text-white text-xs flex items-center gap-1"><Upload size={14}/> Alterar Imagem</span>
                         </div>
                    </div>
                </div>
            )}

            <button 
                onClick={activeTab === 'generate' ? handleGenerate : handleEdit}
                disabled={loading || !prompt}
                className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${activeTab === 'generate' ? 'bg-gradient-to-r from-primary to-blue-600' : 'bg-gradient-to-r from-secondary to-purple-600'}`}
            >
                {loading ? <RefreshCw className="animate-spin mx-auto"/> : (activeTab === 'generate' ? 'Gerar Imagem' : 'Editar Imagem')}
            </button>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex items-center justify-center bg-black/20 relative">
            {loading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <span className="text-primary font-display font-medium animate-pulse">Criando obra-prima...</span>
                </div>
            )}

            {resultImage ? (
                <div className="relative group w-full h-full flex items-center justify-center">
                    <img src={resultImage} alt="Result" className="max-w-full max-h-full rounded-lg shadow-2xl" />
                    <a 
                        href={resultImage} 
                        download="gemini-creation.png"
                        className="absolute bottom-4 right-4 p-3 bg-white text-black rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                    >
                        <Download size={20} />
                    </a>
                </div>
            ) : (
                <div className="text-center text-textMuted opacity-50">
                    <Layers size={64} className="mx-auto mb-4" />
                    <p>A imagem gerada aparecerá aqui</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ImageStudio;