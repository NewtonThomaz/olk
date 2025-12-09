'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { culturaService } from '../services/culturaService';

interface NewCultureModalProps {
  isOpen: boolean;
  onClose: () => void;
  talhaoId: string;
  onSuccess: () => void;
  // Nova prop opcional para receber a cultura existente
  culturaAtual?: { id: string; nome: string } | null; 
}

export default function NewCultureModal({ 
  isOpen, 
  onClose, 
  talhaoId, 
  onSuccess, 
  culturaAtual // Recebendo a prop
}: NewCultureModalProps) {
  
  const { user } = useAuth();
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);

  const cultureOptions = ['Milho', 'Soja', 'Trigo', 'Café', 'Algodão', 'Feijão'];

  // Efeito para preencher o campo quando abrir o modal
  useEffect(() => {
    if (isOpen) {
      if (culturaAtual) {
        // Se tem cultura, preenche o nome (MODO EDIÇÃO)
        setNome(culturaAtual.nome);
      } else {
        // Se não tem, limpa (MODO CRIAÇÃO)
        setNome('');
      }
    }
  }, [isOpen, culturaAtual]);

  if (!isOpen) return null;

  const handleClose = () => {
    setNome('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      alert("Erro: Usuário não identificado.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        nome: nome,
        usuario: { id: user.id },
        talhoes: [{ id: talhaoId }]
      };

      if (culturaAtual && culturaAtual.id) {
        // === ATUALIZAR (PUT) ===
        console.log("Atualizando cultura...", payload);
        await culturaService.update(culturaAtual.id, payload as any);
        // alert("Cultura atualizada com sucesso!");
      } else {
        // === CRIAR (POST) ===
        console.log("Criando nova cultura...", payload);
        await culturaService.create(payload as any);
        // alert("Cultura criada com sucesso!");
      }
      
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar cultura.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-opacity duration-300">
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#6d8a44]">
            {culturaAtual ? 'Editar Cultura' : 'Nova Cultura'}
          </h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-bold text-[#6d8a44] ml-4 mb-1 block">Nome da Cultura</label>
            <input
              type="text"
              list="culture-suggestions"
              autoFocus
              required
              placeholder="Ex: Soja, Milho..."
              className="w-full border border-gray-300 rounded-full py-3 px-4 text-gray-700 focus:outline-none focus:border-[#6d8a44] focus:ring-1 focus:ring-[#6d8a44] shadow-sm bg-white"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
            <datalist id="culture-suggestions">
              {cultureOptions.map((culture) => <option key={culture} value={culture} />)}
            </datalist>
          </div>

          <div className="flex gap-3 mt-8">
            <button type="button" onClick={handleClose} className="flex-1 border border-[#6d8a44] text-gray-800 font-bold py-3 rounded-full hover:bg-gray-50 transition">
              Cancelar
            </button>
            <button type="submit" disabled={loading || !nome} className="flex-1 bg-[#6d8a44] text-white font-bold py-3 rounded-full hover:brightness-90 transition shadow-md flex justify-center items-center disabled:opacity-70">
              {loading ? <Loader2 className="animate-spin" /> : (culturaAtual ? 'Atualizar' : 'Salvar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}