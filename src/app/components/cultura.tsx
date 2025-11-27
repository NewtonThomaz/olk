'use client';

import { useState } from 'react';
import { ArrowLeft, ChevronDown, Plus, Loader2 } from 'lucide-react';
// Importando o hook
import { useCulturaForm } from '../hooks/useCulturaForm';

interface NewCultureModalProps {
  isOpen: boolean;
  onClose: () => void;
  talhaoId: string;
  onSuccess: () => void; // Adicionei para recarregar a página pai
}

export default function NewCultureModal({ isOpen, onClose, talhaoId, onSuccess }: NewCultureModalProps) {
  const [viewState, setViewState] = useState<'select' | 'create'>('select');
  
  // Conectando o Hook
  // A função 'submit' do hook já faz preventDefault e chama o serviço
  const { formData, setFormData, submit, loading } = useCulturaForm(talhaoId, () => {
    onSuccess();
    handleClose();
  });

  // Lista estática para seleção rápida
  const cultureOptions = [
    { id: 'Milho', name: 'Milho' },
    { id: 'Soja', name: 'Soja' },
    { id: 'Trigo', name: 'Trigo' },
    { id: 'Café', name: 'Café' },
    { id: 'Algodão', name: 'Algodão' },
    { id: 'Feijão', name: 'Feijão' },
  ];

  if (!isOpen) return null;

  const handleClose = () => {
    setViewState('select');
    // Limpa o form ao fechar (opcional, mas boa prática)
    setFormData({ nome: '', data: '' });
    onClose();
  };

  // Função auxiliar para mudar o nome quando seleciona na lista
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, nome: e.target.value });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-opacity duration-300 cursor-pointer"
    >
      {/* Container do Modal */}
      <div 
        onClick={(e) => e.stopPropagation()} // Impede fechar ao clicar dentro
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200 cursor-default"
      >
        
        <div className="flex items-center gap-3 mb-8">
          <button 
            onClick={() => viewState === 'create' ? setViewState('select') : handleClose()}
            className="text-[#6d8a44] hover:bg-[#6d8a44]/10 p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#6d8a44]"
          >
            <ArrowLeft size={28} />
          </button>
          
          <h2 className="text-2xl font-bold text-[#6d8a44]">
            {viewState === 'select' ? 'Iniciar Novo Cultivo' : 'Criando nova cultura'}
          </h2>
        </div>

        {/* --- VIEW: SELEÇÃO --- */}
        {viewState === 'select' && (
          <form onSubmit={submit} className="space-y-6">
            <div className="relative">
              <select 
                className="w-full appearance-none border border-gray-300 rounded-full py-3 px-4 text-gray-700 focus:outline-none focus:border-[#6d8a44] focus:ring-1 focus:ring-[#6d8a44] bg-white cursor-pointer shadow-sm"
                value={formData.nome}
                onChange={handleSelectChange}
                required
              >
                <option value="" disabled>Selecione a cultura</option>
                {cultureOptions.map((culture) => (
                  <option key={culture.id} value={culture.id}>
                    {culture.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6d8a44] pointer-events-none" />
            </div>

            {/* CAMPO DE DATA (Necessário para o Backend) */}
            <div className="relative">
                <label className="text-xs font-bold text-[#6d8a44] ml-4 mb-1 block">Data de Início</label>
                <input 
                    type="date" 
                    required
                    className="w-full border border-gray-300 rounded-full py-3 px-4 text-gray-700 focus:outline-none focus:border-[#6d8a44] focus:ring-1 focus:ring-[#6d8a44] shadow-sm"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                />
            </div>

            <button 
              type="button"
              onClick={() => { setFormData({ ...formData, nome: '' }); setViewState('create'); }}
              className="flex items-center gap-2 text-[#6d8a44] text-sm font-medium hover:underline pl-1 group"
            >
              <div className="bg-[#6d8a44] text-white rounded-full p-0.5 group-hover:brightness-90 transition-all">
                <Plus size={14} />
              </div>
              Registrar uma nova cultura manualmente
            </button>

            <div className="flex gap-3 mt-8">
              <button 
                type="button"
                onClick={handleClose}
                className="flex-1 border border-[#6d8a44] text-gray-800 font-bold py-3 rounded-full hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                disabled={loading || !formData.nome || !formData.data}
                className="flex-1 bg-[#6d8a44] text-white font-bold py-3 rounded-full hover:brightness-90 transition shadow-md flex justify-center items-center disabled:opacity-70"
              >
                {loading ? <Loader2 className="animate-spin"/> : 'Salvar'}
              </button>
            </div>
          </form>
        )}

        {/* --- VIEW: CRIAÇÃO MANUAL --- */}
        {viewState === 'create' && (
          <form onSubmit={submit} className="space-y-6 animate-in slide-in-from-right-4 duration-200">
            <div>
              <input 
                type="text" 
                autoFocus
                required
                placeholder="Nome da cultura (Ex: Trigo Sarraceno)"
                className="w-full border border-gray-300 rounded-full py-3 px-4 text-gray-700 focus:outline-none focus:border-[#6d8a44] focus:ring-1 focus:ring-[#6d8a44] shadow-sm"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              />
            </div>

            {/* CAMPO DE DATA TAMBÉM AQUI */}
            <div>
                <label className="text-xs font-bold text-[#6d8a44] ml-4 mb-1 block">Data de Início</label>
                <input 
                    type="date" 
                    required
                    className="w-full border border-gray-300 rounded-full py-3 px-4 text-gray-700 focus:outline-none focus:border-[#6d8a44] focus:ring-1 focus:ring-[#6d8a44] shadow-sm"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                />
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                type="button"
                onClick={() => setViewState('select')}
                className="flex-1 bg-gray-100 text-gray-800 font-bold py-3 rounded-full hover:bg-gray-200 transition"
              >
                Voltar
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#6d8a44] text-white font-bold py-3 rounded-full hover:brightness-90 transition shadow-md flex justify-center items-center"
              >
                {loading ? <Loader2 className="animate-spin"/> : 'Registrar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}