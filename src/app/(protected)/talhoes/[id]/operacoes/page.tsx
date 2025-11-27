'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, ArrowLeft, Trash2 } from 'lucide-react';

// 1. Interface
interface Operacao {
  id: string;
  data: string;
  acao: string; 
  ator: string;
}

// 2. Dados Iniciais
const operacoesIniciais: Operacao[] = [
  { id: '1', data: '12/12', acao: 'Plantou', ator: 'Agrônomo' },
  { id: '2', data: '13/12', acao: 'Irrigou o Talhão', ator: 'Agrônomo' },
  { id: '3', data: '14/12', acao: 'Aplicou Fertilizante', ator: 'Técnico' },
  { id: '4', data: '15/12', acao: 'Monitoramento de Pragas', ator: 'Agrônomo' },
  { id: '5', data: '16/12', acao: 'Colheita Parcial', ator: 'Equipe A' },
  { id: '6', data: '17/12', acao: 'Aplicação de Defensivo', ator: 'Técnico' },
  { id: '7', data: '18/12', acao: 'Irrigação Noturna', ator: 'Sistema' },
  { id: '8', data: '19/12', acao: 'Poda de Limpeza', ator: 'Equipe B' },
  { id: '9', data: '20/12', acao: 'Adubação Foliar', ator: 'Técnico' },
];

export default function OperationsManager() {
  const router = useRouter();
  const [operacoes, setOperacoes] = useState<Operacao[]>(operacoesIniciais);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ data: '', acao: '', ator: '' });

  // --- Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openModalForCreate = () => {
    setFormData({ data: '', acao: '', ator: '' });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setOperacoes(prev => prev.filter(op => op.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.data || !formData.acao || !formData.ator) return;

    let dataFormatada = formData.data;
    if (formData.data.includes('-')) {
      const [ano, mes, dia] = formData.data.split('-');
      dataFormatada = `${dia}/${mes}`;
    }

    const novaOperacao: Operacao = {
      id: Date.now().toString(),
      data: dataFormatada,
      acao: formData.acao,
      ator: formData.ator
    };

    setOperacoes([...operacoes, novaOperacao]);
    setIsModalOpen(false);
    setFormData({ data: '', acao: '', ator: '' });
  };

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
        <span className="w-16 text-center">Quando</span>
        <span className="flex-1 text-left px-2 border-l border-gray-300">Ação</span>
        <span className="w-20 text-center border-l border-gray-300">Ator</span>
        <span className="w-10 text-center"></span>
      </header>

      {/* --- Lista (UL/LI) --- */}
      <ul className="overflow-y-auto flex-1 px-4 pt-2 pb-24 space-y-2 no-scrollbar relative z-0 m-0 list-none">
        {operacoes.length > 0 ? (
          operacoes.map((op) => (
            <li key={op.id} className="flex items-center text-sm py-3 bg-white rounded-lg shadow-sm border border-transparent hover:border-gray-200 transition-colors">
              {/* Data (Time tag é semântica para datas) */}
              <time className="w-16 text-center text-[#7f9c3c] font-medium shrink-0">
                {op.data}
              </time>
              
              {/* Ação */}
              <span className="flex-1 text-left text-[#6e8a33] px-2 truncate font-medium" title={op.acao}>
                {op.acao}
              </span>
              
              {/* Ator */}
              <span className="w-20 text-center text-[#6e8a33] truncate px-1" title={op.ator}>
                {op.ator}
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
            <span className="text-4xl mb-2">🍃</span>
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
      {/* 'aside' usado como container de conteúdo relacionado mas separado (Overlay) */}
      {isModalOpen && (
        <aside 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          {/* 'article' para o conteúdo do modal */}
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
              {/* 'fieldset' para agrupar rótulo e input semânticamente */}
              <fieldset className="border-none p-0 m-0">
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