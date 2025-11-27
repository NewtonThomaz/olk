'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation'; 
import { Search, Trash2, ChevronDown, UserX, UserPlus, Users, ShieldCheck, ArrowLeft, Check, Loader2 } from 'lucide-react';

// --- IMPORTS DE SERVIÇOS ---
import { talhaoService } from '../../../../services/talhaoService';
import { authService } from '../../../../services/authService'; 
import { colaboradorService } from '../../../../services/colaboradorService'; 
import { UsuarioResponseDTO } from '../../../../model/types/auth';
import { Permissao } from '../../../../model/types/enum';
import { ColaboradorRequestDTO } from '../../../../model/types/colaborador';
import { useAuth } from '../../../../hooks/useAuth';

// 1. Interface Interna Estendida para a UI
interface Collaborator extends UsuarioResponseDTO {
  role: Permissao | any; 
  colaboradorId?: string; 
}

export default function UserTeamManager({ params }: { params: Promise<{ id: string }> }) {
  const { id: talhaoId } = use(params);
  const router = useRouter();
  
  // --- Estados de Dados ---
  const [availableUsers, setAvailableUsers] = useState<UsuarioResponseDTO[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  
  // --- Estados de UI ---
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'users' | 'collaborators'>('collaborators');

  // --- CARREGAMENTO DE DADOS ---
  const loadData = async () => {
    try {
      setLoading(true);
      const pTalhao = talhaoService.getDetalhado(talhaoId);
      
      let pUsers = Promise.resolve([] as UsuarioResponseDTO[]);
      if (typeof (authService as any).getAll === 'function') {
        pUsers = (authService as any).getAll();
      }

      const [talhaoData, allUsersData] = await Promise.all([pTalhao, pUsers]);
      
      // 1. Processa Colaboradores
      const currentCollaborators = (talhaoData.colaboradores || []).map((c: any) => ({
        id: c.id_usuario || c.usuario?.id || c.usuarioId,
        nome: c.nome || c.usuario?.nome || c.email, 
        email: c.email || c.usuario?.email,
        fotoPerfil: c.foto || c.usuario?.fotoPerfil,
        role: c.permissao || 'VIEW',
        colaboradorId: c.id 
      })) as Collaborator[];
      
      setCollaborators(currentCollaborators);

      // 2. Processa Usuários Disponíveis
      if (Array.isArray(allUsersData)) {
        const collaboratorUserIds = new Set(currentCollaborators.map(c => c.id));
        const available = allUsersData.filter((u: UsuarioResponseDTO) => !collaboratorUserIds.has(u.id));
        setAvailableUsers(available);
      }

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (talhaoId) loadData();
  }, [talhaoId]);

  // --- AÇÃO (INTEGRAÇÃO COM API) ---

  const handleAddCollaborator = async (user: UsuarioResponseDTO) => {
    setActionLoading(user.id);
    try {
      const payload = {
        talhao: talhaoId,
        usuario: user.id,
        permissao: 'VIEW' as Permissao
      };

      console.log("➕ Tentando adicionar colaborador com payload:", payload);

      await colaboradorService.create(payload as any);
      
      await loadData(); 
      
    } catch (error: any) {
      console.error("❌ Erro detalhado no handleAddCollaborator:", error);

      // DEBUG AVANÇADO: Extrai qualquer mensagem útil do backend
      const serverMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            (typeof error.response?.data === 'object' ? JSON.stringify(error.response?.data, null, 2) : error.response?.data) || 
                            "Sem mensagem de erro do servidor.";
      
      const status = error.response?.status;

      if (status === 403) {
        alert(`⛔ ACESSO NEGADO (403)\n\nDetalhes: ${serverMessage}\n\nO backend recusou sua permissão. Verifique se você é ADMIN/ROOT.`);
      } else if (status === 400) {
        alert(`⚠️ DADOS INVÁLIDOS (400)\n\nO backend rejeitou o formato enviado:\n${serverMessage}`);
      } else {
        alert(`❌ Erro ao adicionar (${status || 'N/A'}): \n${serverMessage}`);
      }

    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveCollaborator = async (collaborator: Collaborator) => {
    if (!collaborator.colaboradorId) {
      alert("Erro: ID do vínculo não encontrado.");
      return;
    }

    if (!confirm(`Remover ${collaborator.nome} do time?`)) return;

    setActionLoading(collaborator.id);
    try {
      await colaboradorService.delete(collaborator.colaboradorId);
      await loadData();
    } catch (error: any) {
      console.error('❌ Erro detalhado no handleRemoveCollaborator:', error);
      
      const serverMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            JSON.stringify(error.response?.data) || 
                            "Verifique o console.";

      if (error.response?.status === 403) {
        alert(`⛔ Sem permissão para remover (403):\n${serverMessage}`);
      } else {
        alert(`Erro ao remover: ${serverMessage}`);
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    // Apenas visual por enquanto
    setCollaborators((prev) => prev.map((c) =>
      c.id === userId ? { ...c, role: newRole as any } : c
    ));
  };

  // --- FUNÇÕES VISUAIS ---
  const renderAvatar = (user: UsuarioResponseDTO) => {
    if (user.fotoPerfil) {
      return (
        <img
          src={user.fotoPerfil}
          alt={user.nome}
          className="w-10 h-10 rounded-full object-cover border border-gray-300 shadow-sm bg-gray-200"
        />
      );
    }
    const initials = (user.nome || user.email || '??').slice(0, 2).toUpperCase();
    return (
      <span className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-xs border border-gray-400 shadow-sm">
        {initials}
      </span>
    );
  };

  const filterList = <T extends UsuarioResponseDTO>(list: T[]): T[] => {
    const lowerTerm = searchTerm.toLowerCase();
    return list.filter((u) =>
      (u.nome && u.nome.toLowerCase().includes(lowerTerm)) ||
      (u.email && u.email.toLowerCase().includes(lowerTerm))
    );
  };
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f2f2f2]">
        <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-10 h-10 text-[#7f9c3c] animate-spin" />
            <span className="text-gray-500 text-sm">Carregando equipe...</span>
        </div>
      </div>
    );
  }

  return (
    <section className="w-full max-w-md mx-auto bg-[#f2f2f2] md:rounded-xl md:border md:border-gray-300 overflow-hidden shadow-sm flex flex-col h-[calc(100dvh-6rem)] md:h-[85vh] mt-4 font-sans relative">

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-300 shrink-0">
        <button
          onClick={() => router.back()}
          className="text-gray-500 hover:text-gray-800 transition-colors p-1 -ml-1 flex items-center gap-1"
          title="Voltar"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-gray-700 font-semibold text-lg flex-1 text-center pr-6">Gerenciar Talhão</h1>
      </header>

      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex items-stretch border-b border-gray-300 bg-[#f2f2f2] shrink-0"
      >
        <input
          type="text"
          placeholder="Buscar por nome ou e-mail..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent px-4 py-3 text-lg text-gray-700 placeholder-gray-500 outline-none"
        />
        <span className="bg-[#7f9c3c] px-5 flex items-center justify-center border-l border-gray-400 rounded--lg">
          <Search className="text-white w-6 h-6" />
        </span>
      </form>

      <nav className="flex border-b border-gray-300 bg-white shrink-0">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'users'
              ? 'text-[#7f9c3c] border-b-2 border-[#7f9c3c] bg-gray-50'
              : 'text-gray-500 hover:bg-gray-50'
            }`}
        >
          <Users className="w-4 h-4" />
          Novos Usuários
          <span className="bg-gray-200 text-gray-600 text-xs py-0.5 px-2 rounded-full">
            {filterList(availableUsers).length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('collaborators')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'collaborators'
              ? 'text-[#7f9c3c] border-b-2 border-[#7f9c3c] bg-gray-50'
              : 'text-gray-500 hover:bg-gray-50'
            }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Colaboradores
          <span className="bg-gray-200 text-gray-600 text-xs py-0.5 px-2 rounded-full">
            {filterList(collaborators).length}
          </span>
        </button>
      </nav>

      <header className="px-4 mt-3 mb-2 flex items-center shrink-0 text-gray-600">
        <span className="flex-1 font-medium text-xs uppercase tracking-wide">Usuário</span>
        {activeTab === 'collaborators' && (
          <>
            <span className="h-4 w-[1px] bg-gray-300 mx-2"></span>
            <span className="w-24 pl-2 font-medium text-xs uppercase tracking-wide">Cargo</span>
          </>
        )}
        <span className="w-8 flex justify-end font-medium text-xs uppercase tracking-wide text-center">Ação</span>
      </header>

      <ul className="overflow-y-auto flex-1 pb-24 bg-[#f2f2f2] relative z-0 no-scrollbar">
        {activeTab === 'users' ? (
          filterList(availableUsers).length > 0 ? (
            filterList(availableUsers).map((user) => (
              <li key={user.id} className="px-4 py-3 flex items-center group hover:bg-white transition-all border-b border-gray-200 last:border-0 mx-2 rounded-lg mb-1">
                <figure className="mr-3 shrink-0 m-0">
                  {renderAvatar(user)}
                </figure>
                <section className="flex-1 min-w-0 pr-2 flex flex-col">
                  <span className="text-gray-900 font-medium text-sm truncate">{user.nome || 'Sem nome'}</span>
                  <span className="text-gray-500 text-xs truncate">{user.email}</span>
                </section>
                <span className="w-8 flex justify-end ml-2">
                  <button
                    onClick={() => handleAddCollaborator(user)}
                    disabled={actionLoading === user.id}
                    className="p-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === user.id ? <Loader2 className="w-5 h-5 animate-spin"/> : <UserPlus className="w-5 h-5" />}
                  </button>
                </span>
              </li>
            ))
          ) : (
            <li className="flex flex-col items-center justify-center h-48 text-gray-400">
              <UserX className="w-12 h-12 mb-2 opacity-30" />
              <p className="text-sm font-medium">
                 {searchTerm ? 'Nenhum usuário encontrado.' : 'Todos os usuários já estão no time.'}
              </p>
            </li>
          )
        ) : (
          filterList(collaborators).length > 0 ? (
            filterList(collaborators).map((collab) => (
              <li key={collab.id} className="px-4 py-3 flex items-center group hover:bg-white transition-all border-b border-gray-200 last:border-0 mx-2 rounded-lg mb-1">
                <figure className="mr-3 shrink-0 m-0">
                  {renderAvatar(collab)}
                </figure>
                <section className="flex-1 min-w-0 pr-2 flex flex-col">
                  <span className="text-gray-900 font-medium text-sm truncate">{collab.nome || 'Sem nome'}</span>
                  <span className="text-gray-500 text-xs truncate">{collab.email}</span>
                </section>
                <span className="w-24 pl-2 relative flex items-center">
                  <select
                    value={collab.role}
                    onChange={(e) => handleRoleChange(collab.id, e.target.value)}
                    className="appearance-none bg-transparent w-full text-xs text-gray-700 font-bold py-1 pr-4 outline-none cursor-pointer z-10 uppercase tracking-tight"
                  >
                    <option value="ROOT">ROOT</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="VIEW">VIEW</option>
                  </select>
                  <ChevronDown className="absolute right-0 text-gray-400 w-3 h-3 z-0 pointer-events-none" />
                </span>
                <span className="w-8 flex justify-end ml-2">
                  <button
                    onClick={() => handleRemoveCollaborator(collab)}
                    disabled={actionLoading === collab.id}
                    className="p-1.5 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === collab.id ? <Loader2 className="w-5 h-5 animate-spin"/> : <Trash2 className="w-5 h-5" />}
                  </button>
                </span>
              </li>
            ))
          ) : (
            <li className="flex flex-col items-center justify-center h-48 text-gray-400">
              <ShieldCheck className="w-12 h-12 mb-2 opacity-30" />
              <p className="text-sm font-medium">Nenhum colaborador no Talhão.</p>
            </li>
          )
        )}
      </ul>

      <footer className="absolute bottom-0 w-full p-4 bg-white border-t border-gray-300 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <button
          onClick={() => router.back()}
          className="w-full bg-[#7f9c3c] hover:bg-[#6e8a33] text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <Check className="w-5 h-5" />
          Concluído
        </button>
      </footer>

    </section>
  );
}