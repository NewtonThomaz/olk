'use client';

import React, { useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation'; 
import { Search, Trash2, ChevronDown, UserX, UserPlus, Users, ShieldCheck, ArrowLeft, Check } from 'lucide-react';

// 1. Interfaces
interface User {
  id: string;
  nome: string;
  email: string;
  foto?: string | null;
}

interface Collaborator extends User {
  role: 'ROOT' | 'ADMIN' | 'VIEW';
}

// Dados Iniciais
const initialAvailableUsers: User[] = [
  { id: '1', nome: 'Newton', email: 'newton@gmail.com', foto: 'https://i.pravatar.cc/150?u=1' },
  { id: '2', nome: 'Einstein', email: 'einstein@relativity.com', foto: null },
  { id: '3', nome: 'Darwin', email: 'charles@evolution.com', foto: 'https://i.pravatar.cc/150?u=3' },
  { id: '5', nome: 'Tesla', email: 'nikola@electricity.com', foto: null },
  { id: '7', nome: 'Galileu', email: 'galileu@stars.com', foto: null },
  { id: '8', nome: 'Hawking', email: 'stephen@blackhole.com', foto: 'https://i.pravatar.cc/150?u=8' },
  { id: '9', nome: 'Turing', email: 'alan@enigma.com', foto: null },
  { id: '10', nome: 'Sagan', email: 'carl@cosmos.com', foto: 'https://i.pravatar.cc/150?u=10' },
];

const initialCollaborators: Collaborator[] = [
  { id: '4', nome: 'Curie', email: 'marie.curie@radioactive.com', foto: 'https://i.pravatar.cc/150?u=4', role: 'ADMIN' },
  { id: '6', nome: 'Lovelace', email: 'ada@code.com', foto: 'https://i.pravatar.cc/150?u=6', role: 'ROOT' },
];

export default function UserTeamManager() {
  const router = useRouter(); // Agora usa o hook real do Next.js
  const [availableUsers, setAvailableUsers] = useState<User[]>(initialAvailableUsers);
  const [collaborators, setCollaborators] = useState<Collaborator[]>(initialCollaborators);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'users' | 'collaborators'>('collaborators');

  const renderAvatar = (user: User) => {
    if (user.foto) {
      return (
        <img
          src={user.foto}
          alt={user.nome}
          className="w-10 h-10 rounded-full object-cover border border-gray-300 shadow-sm bg-gray-200"
        />
      );
    }
    const initials = user.nome.slice(0, 2).toUpperCase();
    return (
      <span className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-xs border border-gray-400 shadow-sm">
        {initials}
      </span>
    );
  };

  const filterList = <T extends User>(list: T[]): T[] => {
    const lowerTerm = searchTerm.toLowerCase();
    return list.filter((u) =>
      u.nome.toLowerCase().includes(lowerTerm) ||
      u.email.toLowerCase().includes(lowerTerm)
    );
  };

  const handleAddCollaborator = (user: User) => {
    setAvailableUsers((prev) => prev.filter((u) => u.id !== user.id));
    const newCollaborator: Collaborator = { ...user, role: 'VIEW' };
    setCollaborators((prev) => [...prev, newCollaborator]);
  };

  const handleRemoveCollaborator = (collaborator: Collaborator) => {
    setCollaborators((prev) => prev.filter((c) => c.id !== collaborator.id));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { role, ...userUser } = collaborator;
    setAvailableUsers((prev) => [...prev, userUser]);
  };

  const handleRoleChange = (id: string, newRole: string) => {
    const roleTyped = newRole as Collaborator['role'];
    setCollaborators((prev) => prev.map((c) =>
      c.id === id ? { ...c, role: roleTyped } : c
    ));
  };

  const handleFinish = () => {
    console.log('Salvando alterações:', collaborators);
    router.back();
  };
  
  return (
    <section className="w-full max-w-md mx-auto bg-[#f2f2f2] md:rounded-xl md:border md:border-gray-300 overflow-hidden shadow-sm flex flex-col h-[calc(100dvh-6rem)] md:h-[85vh] mt-4 font-sans relative">

      {/* --- Estilos para esconder a barra de rolagem --- */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>

      {/* --- 1. Cabeçalho --- */}
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

      {/* --- 2. Busca --- */}
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex items-stretch border-b border-gray-300 bg-[#f2f2f2] shrink-0"
      >
        <input
          type="text"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent px-4 py-3 text-lg text-gray-700 placeholder-gray-500 outline-none"
        />
        <span className="bg-[#7f9c3c] px-5 flex items-center justify-center border-l border-gray-400 rounded--lg">
          <Search className="text-white w-6 h-6" />
        </span>
      </form>

      {/* --- 3. Abas --- */}
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
            {availableUsers.length}
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
            {collaborators.length}
          </span>
        </button>
      </nav>

      {/* --- 4. Cabeçalhos da Lista --- */}
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

      {/* --- 5. Lista Rolável --- */}
      {/* A classe 'pb-24' garante que o último item não fique escondido atrás do botão */}
      <ul className="overflow-y-auto flex-1 pb-24 bg-[#f2f2f2] relative z-0 no-scrollbar">
        {activeTab === 'users' ? (
          // --- LISTA DE USUÁRIOS ---
          filterList(availableUsers).length > 0 ? (
            filterList(availableUsers).map((user) => (
              <li key={user.id} className="px-4 py-3 flex items-center group hover:bg-white transition-all border-b border-gray-200 last:border-0 mx-2 rounded-lg mb-1">
                <figure className="mr-3 shrink-0 m-0">
                  {renderAvatar(user)}
                </figure>

                <section className="flex-1 min-w-0 pr-2 flex flex-col">
                  <span className="text-gray-900 font-medium text-sm truncate">{user.nome}</span>
                  <span className="text-gray-500 text-xs truncate">{user.email}</span>
                </section>

                <span className="w-8 flex justify-end ml-2">
                  <button
                    onClick={() => handleAddCollaborator(user)}
                    className="p-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                  >
                    <UserPlus className="w-5 h-5" />
                  </button>
                </span>
              </li>
            ))
          ) : (
            <li className="flex flex-col items-center justify-center h-48 text-gray-400">
              <UserX className="w-12 h-12 mb-2 opacity-30" />
              <p className="text-sm font-medium">Nenhum usuário disponível.</p>
            </li>
          )
        ) : (
          // --- LISTA DE COLABORADORES ---
          filterList(collaborators).length > 0 ? (
            filterList(collaborators).map((collab) => (
              <li key={collab.id} className="px-4 py-3 flex items-center group hover:bg-white transition-all border-b border-gray-200 last:border-0 mx-2 rounded-lg mb-1">
                <figure className="mr-3 shrink-0 m-0">
                  {renderAvatar(collab)}
                </figure>

                <section className="flex-1 min-w-0 pr-2 flex flex-col">
                  <span className="text-gray-900 font-medium text-sm truncate">{collab.nome}</span>
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
                    className="p-1.5 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
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

      {/* --- 6. Rodapé Fixo (Absolute) --- */}
      <footer className="absolute bottom-0 w-full p-4 bg-white border-t border-gray-300 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <button
          onClick={handleFinish}
          className="w-full bg-[#7f9c3c] hover:bg-[#6e8a33] text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <Check className="w-5 h-5" />
          Concluído
        </button>
      </footer>

    </section>
  );
}