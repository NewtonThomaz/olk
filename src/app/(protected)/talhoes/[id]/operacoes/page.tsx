'use client';

import React, { useState, useEffect, use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, ArrowLeft, Trash2, Loader2, Leaf } from 'lucide-react';

// --- IMPORTS ---
import { operacaoService } from '../../../../services/operacaoService';
import { OperacaoDTO } from '../../../../model/types/operacao';

export default function OperationsManager({ params }: { params: Promise<{ id: string }> }) {
  const { id: talhaoId } = use(params);
  const router = useRouter();

  // --- Estados ---
  const [operacoes, setOperacoes] = useState<OperacaoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estado do formulário
  const [formData, setFormData] = useState({ 
    data: '', // Input type="date" usa string YYYY-MM-DD
    hora: '', // Input type="time"
    acao: '', 
    ator: '' 
  });

  // --- Filtro e Ordenação no Frontend ---
  // Garante que a lista esteja sempre ordenada por data (mais recente primeiro)
  const operacoesOrdenadas = useMemo(() => {
    return [...operacoes].sort((a, b) => {
      const dateA = new Date(a.dataHora).getTime();
      const dateB = new Date(b.dataHora).getTime();
      return dateB - dateA; // Decrescente (Mais novo -> Mais antigo)
    });
  }, [operacoes]);

  // --- Carregamento ---
  const loadData = async () => {
    try {
      setLoading(true);
      const data = await operacaoService.getByTalhao(talhaoId);
      // Salvamos os dados como vieram da API. A ordenação é feita no useMemo acima.
      setOperacoes(data);
    } catch (error) {
      console.error("Erro ao carregar operações:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (talhaoId) loadData();
  }, [talhaoId]);

  // --- Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openModalForCreate = () => {
    // Reseta form com data/hora atual
    const now = new Date();
    setFormData({ 
      data: now.toISOString().split('T')[0], 
      hora: now.toTimeString().split(' ')[0].substring(0, 5),
      acao: '', 
      ator: '' 
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    // REMOVIDO: Linha de confirmação (confirm) para deletar direto
    // if (!confirm("Tem certeza que deseja excluir este registro?")) return;

    try {
      await operacaoService.delete(id);
      // Atualização otimista ou recarregamento
      setOperacoes(prev => prev.filter(op => op.id !== id));
    } catch (error) {
      console.error("Erro ao deletar:", error);
      alert("Erro ao excluir operação.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.data || !formData.acao || !formData.ator) return;

    try {
      // Monta o LocalDateTime (ISO-8601) combinando data e hora
      const dataHoraISO = `${formData.data}T${formData.hora || '12:00'}:00`;

      const payload = {
        idTalhao: talhaoId,
        operacao: formData.acao,
        agente: formData.ator,
        dataHora: dataHoraISO
      };

      await operacaoService.create(payload);
      
      await loadData(); // Recarrega lista atualizada do servidor
      setIsModalOpen(false);
      
    } catch (error: any) {
      console.error("Erro ao criar:", error);
      const msg = error.response?.data?.message || "Verifique os dados.";
      alert(`Erro ao registrar: ${msg}`);
    }
  };

  // --- Formatadores ---
  const formatDataDisplay = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    } catch (e) {
      return '--/--';
    }
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f2f2f2]">
            <Loader2 className="w-10 h-10 text-[#6d8a44] animate-spin" />
        </div>
    );
  }

  return (
    <section className="w-full max-w-md mx-auto bg-[#f2f2f2] md:rounded-xl md:border md:border-gray-300 overflow-hidden shadow-sm flex flex-col h-[calc(100dvh-6rem)] md:h-[85vh] mt-4 font-sans relative">
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* --- Cabeçalho da Página --- */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-300 shrink-0">
        <button 
          onClick={() => router.back()} 
          className="text-gray-500 hover:text-gray-800 transition-colors p-1 -ml-1 flex items-center gap-1"
          title="Voltar"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        <h1 className="text-gray-700 font-semibold text-lg flex-1 text-center pr-6">
          Registros de Operações
        </h1>
      </header>

      {/* --- Cabeçalho da Tabela --- */}
      <header className="flex px-4 py-2 mt-2 border-b border-gray-300/50 bg-[#f2f2f2] shrink-0 text-sm font-medium text-[#3a3a3a]">
        <span className="w-16 text-center">Data</span>
        <span className="flex-1 text-left px-2 border-l border-gray-300">Ação</span>
        <span className="w-20 text-center border-l border-gray-300">Ator</span>
        <span className="w-10 text-center"></span>
      </header>

      {/* --- Lista (UL/LI) --- */}
      <ul className="overflow-y-auto flex-1 px-4 pt-2 pb-24 space-y-2 no-scrollbar relative z-0 m-0 list-none">
        {operacoesOrdenadas.length > 0 ? (
          operacoesOrdenadas.map((op) => (
            <li key={op.id} className="flex items-center text-sm py-3 bg-white rounded-lg shadow-sm border border-transparent hover:border-gray-200 transition-colors">
              {/* Data */}
              <time className="w-16 text-center text-[#7f9c3c] font-medium shrink-0 flex flex-col justify-center">
                <span>{formatDataDisplay(op.dataHora)}</span>
                {/* Opcional: mostrar hora pequena embaixo */}
                <span className="text-[10px] text-gray-400">
                    {new Date(op.dataHora).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                </span>
              </time>
              
              {/* Ação */}
              <span className="flex-1 text-left text-[#6e8a33] px-2 truncate font-medium" title={op.operacao}>
                {op.operacao}
              </span>
              
              {/* Ator */}
              <span className="w-20 text-center text-[#6e8a33] truncate px-1" title={op.agente}>
                {op.agente}
              </span>

              {/* Botão Excluir */}
              <span className="w-10 flex justify-center shrink-0">
                <button 
                  onClick={() => handleDelete(op.id)}
                  className="text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </span>
            </li>
          ))
        ) : (
          <li className="text-center text-gray-400 py-10 italic flex flex-col items-center">
            <Leaf className="w-12 h-12 mb-2 opacity-30 text-[#7f9c3c]" />
            Nenhuma operação registrada.
          </li>
        )}
      </ul>

      {/* --- Rodapé Fixo --- */}
      <footer className="absolute bottom-0 w-full p-4 bg-white border-t border-gray-300 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <button
          onClick={openModalForCreate}
          className="w-full bg-[#7f9c3c] hover:bg-[#6e8a33] text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <Plus className="w-5 h-5 text-white" />
          <span>Registrar Operação</span>
        </button>
      </footer>

      {/* --- POPUP / MODAL --- */}
      {isModalOpen && (
        <aside 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <article 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <header className="mb-6">
              <h2 className="text-2xl font-semibold text-center text-gray-800">
                Nova Operação
              </h2>
            </header>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="flex gap-4">
                  <fieldset className="border-none p-0 m-0 flex-1">
                    <label className="block text-[#4a5f25] font-semibold text-base mb-1 ml-1">
                      Data <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date" 
                      name="data"
                      value={formData.data}
                      onChange={handleInputChange}
                      className="w-full bg-[#f2f2f2] border-2 border-transparent focus:border-[#7f9c3c]/50 rounded-xl py-3 px-4 text-gray-700 outline-none transition-all"
                      required
                    />
                  </fieldset>

                  <fieldset className="border-none p-0 m-0 w-1/3">
                    <label className="block text-[#4a5f25] font-semibold text-base mb-1 ml-1">
                      Hora
                    </label>
                    <input
                      type="time" 
                      name="hora"
                      value={formData.hora}
                      onChange={handleInputChange}
                      className="w-full bg-[#f2f2f2] border-2 border-transparent focus:border-[#7f9c3c]/50 rounded-xl py-3 px-4 text-gray-700 outline-none transition-all"
                    />
                  </fieldset>
              </div>

              <fieldset className="border-none p-0 m-0">
                <label className="block text-[#4a5f25] font-semibold text-base mb-1 ml-1">
                  Ação <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="acao"
                  placeholder="Ex: Plantio de mudas"
                  value={formData.acao}
                  onChange={handleInputChange}
                  className="w-full bg-[#f2f2f2] border-2 border-transparent focus:border-[#7f9c3c]/50 rounded-xl py-3 px-4 text-gray-700 placeholder-gray-400 outline-none transition-all"
                  required
                />
              </fieldset>

              <fieldset className="border-none p-0 m-0">
                <label className="block text-[#4a5f25] font-semibold text-base mb-1 ml-1">
                  Ator <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="ator"
                  placeholder="Ex: João Silva"
                  value={formData.ator}
                  onChange={handleInputChange}
                  className="w-full bg-[#f2f2f2] border-2 border-transparent focus:border-[#7f9c3c]/50 rounded-xl py-3 px-4 text-gray-700 placeholder-gray-400 outline-none transition-all"
                  required
                />
              </fieldset>

              <footer className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-[#7f9c3c] hover:bg-[#6e8a33] text-white text-xl font-medium py-3 rounded-xl transition-colors shadow-md active:scale-[0.98]"
                >
                  Criar Registro
                </button>
              </footer>
            </form>
          </article>
        </aside>
      )}
    </section>
  );
}