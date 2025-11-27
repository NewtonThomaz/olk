'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Trash2, Plus, Search, ChevronDown, 
  Eye, Leaf, X, Loader2, Save 
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- IMPORTS DE SERVIÇOS E TIPOS ---
import { talhaoService } from '../../../services/talhaoService';
import { TalhaoDetalhadoDTO } from '../../../model/types/talhao'; // Ajuste se necessário
import { CulturaDTO } from '../../../model/types/cultura'; // Ajuste se necessário
import { OperacaoDTO } from '../../../model/types/operacao'; // Ajuste se necessário
import { ColaboradorDTO } from '../../../model/types/colaborador'; // Ajuste se necessário
import { Permissao, Medida } from '../../../model/types/enum'; // Importando Enums
import { useAuth } from '../../../hooks/useAuth';

// --- IMPORTS DOS COMPONENTES EXTERNOS (MODAIS) ---
import NewCultureModal from '../../../components/cultura'; 
import SensorModal from '../../../components/sensor';

// --- IMPORTS DOS HOOKS PARA AS SUB-TELAS ---
import { useOperacaoForm } from '../../../hooks/useOperacaoForm';
import { useColaboradorForm } from '../../../hooks/useColaboradorForm';

// --- COMPONENTE PRINCIPAL ---
export default function TalhaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  // Estados de Dados
  const [talhao, setTalhao] = useState<TalhaoDetalhadoDTO | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados de Navegação Interna
  const [currentScreen, setCurrentScreen] = useState('MAIN'); 
  
  // Estados dos Modais Externos
  const [isCultureModalOpen, setIsCultureModalOpen] = useState(false);
  
  // CORREÇÃO 1: Tipagem explícita e consistente em MAIÚSCULO
  const [sensorModalState, setSensorModalState] = useState<{
    isOpen: boolean;
    type: 'TEMPERATURA' | 'UMIDADE' | null;
  }>({ isOpen: false, type: null });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); 

  // --- CARREGAR DADOS REAIS ---
  const loadData = async () => {
    try {
      const data = await talhaoService.getDetalhado(id);
      setTalhao(data);
      
      // Atualiza estado visual dos sensores se existirem
      // (Lógica opcional se você quiser controlar "sensores registrados" visualmente)
    } catch (err) {
      console.error(err);
      alert("Erro ao carregar dados do talhão.");
      router.push('/home');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // --- AÇÃO DE EXCLUIR ---
  const handleDeleteTalhao = async () => {
    try {
      await talhaoService.delete(id);
      router.push('/home');
    } catch (error) {
      alert('Erro ao excluir talhão.');
      setShowDeleteConfirm(false);
    }
  };

  // Navegação
  const goBack = () => setCurrentScreen('MAIN');
  const goTo = (screen: string) => setCurrentScreen(screen);

  // CORREÇÃO 2: Função auxiliar agora aceita MAIÚSCULAS
  const openSensorModal = (type: 'TEMPERATURA' | 'UMIDADE') => {
    setSensorModalState({ isOpen: true, type });
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Loader2 className="w-10 h-10 text-[#6e8e38] animate-spin" />
        </div>
    );
  }

  if (!talhao) return null;

  // Roteador de Telas Internas
  const renderScreen = () => {
    switch (currentScreen) {
      case 'MAIN':
        return (
          <MainScreen 
            talhao={talhao}
            goTo={goTo} 
            openSensorModal={openSensorModal}
            openCultureModal={() => setIsCultureModalOpen(true)}
            setShowDeleteConfirm={setShowDeleteConfirm}
            router={router}
          />
        );
      case 'HISTORY': 
        return <HistoryScreen goBack={goBack} goTo={goTo} operacoes={talhao.operacoes || []} />;
      
      case 'ADD_OPERATION': 
        return <AddOperationScreen goBack={() => goTo('HISTORY')} talhaoId={id} agente={user?.nome || 'Usuário'} onSuccess={loadData} />;
      
      case 'COLLABORATORS': 
        return <CollaboratorsScreen goBack={goBack} colaboradores={talhao.colaboradores || []} talhaoId={id} onSuccess={loadData} />;
      
      default:
        return <MainScreen talhao={talhao} goTo={goTo} router={router} />;
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex justify-center font-sans items-start pt-0 md:py-8 px-0 md:px-4">
      <section className="w-full md:max-w-6xl bg-white min-h-screen md:min-h-[85vh] md:rounded-3xl md:shadow-2xl relative overflow-hidden flex flex-col">
        {renderScreen()}
        
        {showDeleteConfirm && (
          <DeleteConfirmationPopup 
            onCancel={() => setShowDeleteConfirm(false)} 
            onConfirm={handleDeleteTalhao}
          />
        )}

        {/* Modais Externos Conectados */}
        <NewCultureModal 
            isOpen={isCultureModalOpen}
            onClose={() => setIsCultureModalOpen(false)}
            talhaoId={id}
            onSuccess={loadData}
        />

        <SensorModal 
            isOpen={sensorModalState.isOpen}
            type={sensorModalState.type}
            onClose={() => setSensorModalState({ ...sensorModalState, isOpen: false })}
            talhaoId={id}
            onSuccess={loadData}
        />

      </section>
    </main>
  );
}

// ============================================================================
// TELAS INTERNAS
// ============================================================================

// 1. TELA PRINCIPAL (Dashboard)
function MainScreen({ talhao, goTo, openSensorModal, openCultureModal, setShowDeleteConfirm, router }: any) {
  
  const culturaAtual = talhao.culturas?.length > 0 ? talhao.culturas[0].nome : "Sem cultura";
  const culturasAnteriores = talhao.culturas?.slice(1, 4) || [];

  // CORREÇÃO 3: Usando METROS_QUADRADOS (Plural, conforme definido no Enum)
  const unidadeDisplay = talhao.medida === Medida.HECTARE ? 'ha' : 
                         talhao.medida === Medida.METROS_QUADRADOS ? 'm²' : 'alq';

  // Controle local dos gráficos
  const [showTempGraph, setShowTempGraph] = useState(true);
  const [showHumidityGraph, setShowHumidityGraph] = useState(true);

  // Dados mockados para o gráfico
  const mockData = [
    { dia: 'Seg', valor: 24 }, { dia: 'Ter', valor: 26 }, { dia: 'Qua', valor: 22 },
    { dia: 'Qui', valor: 28 }, { dia: 'Sex', valor: 25 }, { dia: 'Sab', valor: 23 },
  ];

  return (
    <article className="p-4 md:p-8 space-y-6 h-full flex flex-col">
      
      <header className="flex items-center justify-between text-[#6e8e38]">
        <button onClick={() => router.push('/home')} aria-label="Voltar" className="hover:opacity-80 transition-opacity">
           <ArrowLeft size={32} />
        </button>
        <span className="md:hidden font-bold truncate max-w-[200px]">{talhao.nome}</span>
      </header>

      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 flex-1">
        
        {/* COLUNA ESQUERDA */}
        <div className="lg:col-span-4 space-y-6 flex flex-col">
          <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wide mb-2">Nome do Talhão</h2>
            <h1 className="text-3xl font-medium text-[#4a5e2a] leading-tight">{talhao.nome}</h1>
          </section>

          <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex-1">
            <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wide mb-3">Descrição</h2>
            <p className="text-base text-gray-600 leading-relaxed whitespace-pre-wrap">
              {talhao.descricao || "Nenhuma descrição cadastrada."}
            </p>
          </section>
        </div>

        {/* COLUNA DIREITA */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* STATS ROW */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <article className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col justify-center items-center shadow-sm h-32 hover:border-[#6e8e38] transition-colors">
              <span className="text-xs font-bold text-gray-800 uppercase">Tamanho</span>
              <span className="text-3xl font-medium text-[#4a5e2a] mt-2">
                {talhao.tamanho.toLocaleString('pt-BR')} <small className="text-sm">{unidadeDisplay}</small>
              </span>
            </article>

            <article className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col justify-between items-center shadow-sm h-32 relative hover:border-[#6e8e38] transition-colors">
              <span className="text-xs font-bold text-gray-800 uppercase">Colaboradores</span>
              <span className="text-4xl font-medium text-[#4a5e2a]">{talhao.colaboradores?.length || 0}</span>
              <button onClick={() => goTo('COLLABORATORS')} className="flex items-center gap-1 text-xs text-[#6e8e38] border border-[#6e8e38] rounded-full px-3 py-1 hover:bg-[#6e8e38] hover:text-white transition-all">
                <Plus size={12} /> gerenciar
              </button>
            </article>

            <article 
                onClick={openCultureModal} 
                className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col justify-center items-center shadow-sm h-32 cursor-pointer border-l-4 border-l-[#6e8e38] hover:bg-green-50 transition-colors group"
            >
              <span className="text-xs font-bold text-gray-800 uppercase">Cultura Atual</span>
              <span className="text-2xl font-medium text-[#4a5e2a] group-hover:scale-105 transition-transform text-center w-full truncate px-2">
                  {culturaAtual}
              </span>
              <span className="text-[10px] text-gray-400 mt-1 group-hover:text-[#6e8e38]">Alterar</span>
            </article>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col justify-between">
                <h2 className="text-xs font-bold text-gray-800 uppercase mb-4">Culturas Anteriores</h2>
                <ul className="flex justify-around items-center w-full h-full">
                  {culturasAnteriores.length > 0 ? culturasAnteriores.map((c: any) => (
                      <li key={c.id} className="text-center list-none">
                        <div className="text-lg font-medium text-[#4a5e2a]">{c.nome}</div>
                        <div className="text-xs font-bold text-gray-500">({new Date(c.data).getFullYear()})</div>
                      </li>
                  )) : <span className="text-gray-400 text-sm italic">Sem histórico recente</span>}
                </ul>
              </section>

              <nav onClick={() => goTo('HISTORY')} className="bg-[#f4f7f0] border border-[#6e8e38] rounded-2xl p-5 shadow-sm cursor-pointer hover:bg-[#e9efe5] transition-colors flex items-center gap-4 group">
                  <div className="bg-[#7d9d42] w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                    <Eye className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-[#4a5e2a] font-bold text-lg">Histórico</h3>
                    <p className="text-[#4a5e2a]/80 text-sm">{talhao.operacoes?.length || 0} operações registradas</p>
                  </div>
              </nav>
          </div>

          {/* SENSORES */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
             <h2 className="text-xl font-bold text-[#2e3b1a] mb-6">Monitoramento</h2>
             
             {/* TEMPERATURA */}
             <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-[#6d8a44] text-sm font-bold">Temperatura</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={showTempGraph} onChange={() => setShowTempGraph(!showTempGraph)} className="sr-only peer"/>
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#6d8a44]"></div>
                    </label>
                </div>
                
                {!showTempGraph ? (
                    <div className="flex rounded-lg shadow-sm border border-gray-200 overflow-hidden h-12 items-center justify-between pl-4">
                        <span className="text-gray-600 text-sm truncate">{talhao.sensorTemperatura?.ip || "Não instalado"}</span>
                        {/* CORREÇÃO 4: Passando argumento MAIÚSCULO */}
                        <button onClick={() => openSensorModal('TEMPERATURA')} className="bg-[#6d8a44] text-white px-4 h-full text-sm hover:brightness-90">Editar</button>
                    </div>
                ) : (
                    <div className="h-32 w-full bg-gray-50 rounded-lg p-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={mockData}><Line type="monotone" dataKey="valor" stroke="#6d8a44" strokeWidth={2} dot={false} /></LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
             </div>

             {/* UMIDADE */}
             <div>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-[#6d8a44] text-sm font-bold">Umidade</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={showHumidityGraph} onChange={() => setShowHumidityGraph(!showHumidityGraph)} className="sr-only peer"/>
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#6d8a44]"></div>
                    </label>
                </div>
                
                {!showHumidityGraph ? (
                    <div className="flex rounded-lg shadow-sm border border-gray-200 overflow-hidden h-12 items-center justify-between pl-4">
                        <span className="text-gray-600 text-sm truncate">{talhao.sensorUmidade?.ip || "Não instalado"}</span>
                        {/* CORREÇÃO 5: Passando argumento MAIÚSCULO */}
                        <button onClick={() => openSensorModal('UMIDADE')} className="bg-[#6d8a44] text-white px-4 h-full text-sm hover:brightness-90">Editar</button>
                    </div>
                ) : (
                    <div className="h-32 w-full bg-gray-50 rounded-lg p-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={mockData}><Line type="monotone" dataKey="valor" stroke="#6d8a44" strokeWidth={2} dot={false} /></LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
             </div>

          </section>
        </div>
      </div>

      <footer className="flex justify-end border-t pt-4 mt-auto">
        <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-2 text-red-500 px-6 py-2 rounded-xl font-bold hover:bg-red-50 transition-colors">
           Excluir Talhão <Trash2 size={20} />
        </button>
      </footer>
    </article>
  );
}

// 2. TELA HISTÓRICO
function HistoryScreen({ goBack, goTo, operacoes }: any) {
  return (
    <section className="p-0 md:p-8 h-full flex flex-col relative">
       <header className="flex items-center justify-between p-6 md:p-0 mb-6">
          <h1 className="text-2xl font-bold text-[#2e3b1a]">Registros de Operações</h1>
          <button onClick={goBack} className="text-black hover:bg-gray-100 p-2 rounded-full transition-colors"><X size={32} /></button>
       </header>
       <section className="flex-1 bg-gray-100 md:rounded-3xl p-6 overflow-y-auto">
          <div className="w-full">
             <header className="grid grid-cols-3 text-[#4a5e2a] text-sm mb-4 border-b border-gray-300 pb-3 font-bold">
                <span className="border-r border-gray-300">Data</span><span className="text-center">Ação</span><span className="text-right">Ator</span>
             </header>
             <ul className="space-y-3">
                {operacoes && operacoes.length > 0 ? operacoes.map((op: any) => (
                    <li key={op.id} className="grid grid-cols-3 text-sm text-[#7d9d42] font-medium bg-white p-3 rounded-lg shadow-sm">
                       <span className="border-r border-gray-200 pr-2">{new Date(op.dataHora).toLocaleDateString()}</span>
                       <span className="border-r border-gray-200 px-2 text-center">{op.operacao}</span>
                       <span className="text-right pl-2 truncate">{op.agente}</span>
                    </li>
                )) : <p className="text-center text-gray-400 mt-10">Nenhuma operação registrada.</p>}
             </ul>
          </div>
       </section>
       <footer className="p-6 md:px-0">
         <button onClick={() => goTo('ADD_OPERATION')} className="w-full md:w-auto mx-auto border-2 border-[#4a5e2a] bg-[#e9efe5] text-[#4a5e2a] py-4 rounded-full flex items-center justify-center gap-3 font-bold">
            <Plus size={20}/> Registrar Operação
         </button>
       </footer>
    </section>
  );
}

// 3. TELA ADICIONAR OPERAÇÃO
function AddOperationScreen({ goBack, talhaoId, agente, onSuccess }: any) {
  const { formData, setFormData, submit, loading } = useOperacaoForm(talhaoId, agente, onSuccess);
  return (
    <section className="w-full max-w-2xl mx-auto p-6 h-full flex flex-col justify-center">
       <h1 className="text-3xl font-bold text-black mb-10 text-center">Nova Operação</h1>
       <form onSubmit={submit} className="w-full space-y-6 max-w-md mx-auto">
          <label className="block"><span className="font-bold text-[#4a5e2a] block mb-2">Data</span>
             <input type="datetime-local" className="w-full border rounded-2xl p-4 outline-none focus:border-[#4a5e2a]" 
                value={formData.dataHora} onChange={e => setFormData({...formData, dataHora: e.target.value})} required />
          </label>
          <label className="block"><span className="font-bold text-[#4a5e2a] block mb-2">Ação</span>
             <input type="text" className="w-full border rounded-2xl p-4 outline-none focus:border-[#4a5e2a]" placeholder="Ex: Irrigação"
                value={formData.operacao} onChange={e => setFormData({...formData, operacao: e.target.value})} required />
          </label>
          <label className="block"><span className="font-bold text-[#4a5e2a] block mb-2">Ator</span>
             <input type="text" className="w-full border rounded-2xl p-4 bg-gray-100"
                value={formData.agente} disabled />
          </label>
          <div className="flex gap-4 mt-8">
             <button type="button" onClick={goBack} className="flex-1 border-2 border-[#4a5e2a] text-[#4a5e2a] py-3 rounded-2xl font-bold">Cancelar</button>
             <button type="submit" disabled={loading} className="flex-1 bg-[#7d9d42] text-white py-3 rounded-2xl font-bold disabled:opacity-70">
                {loading ? <Loader2 className="animate-spin mx-auto"/> : 'Criar'}
             </button>
          </div>
       </form>
    </section>
  );
}

// 4. TELA COLABORADORES
function CollaboratorsScreen({ goBack, colaboradores, talhaoId, onSuccess }: any) {
  const { formData, setFormData, submit, remove, loading } = useColaboradorForm(talhaoId, onSuccess);
  return (
    <section className="p-6 md:p-8 h-full flex flex-col relative">
        <header className="flex items-center justify-between mb-8">
             <h1 className="text-2xl font-bold text-[#2e3b1a]">Colaboradores</h1>
            <button onClick={goBack} className="text-black hover:bg-gray-100 p-2 rounded-full transition-colors"><X size={32}/></button>
        </header>
        
        <div className="max-w-3xl mx-auto w-full">
            <form onSubmit={submit} className="border-2 border-[#7d9d42] rounded-2xl overflow-hidden flex mb-8 h-14">
                <input type="email" placeholder="Email do colaborador..." className="flex-1 bg-[#f9f9f9] px-6 outline-none"
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                <select className="bg-gray-100 px-4 text-[#4a5e2a] font-bold outline-none cursor-pointer" value={formData.permissao} onChange={e => setFormData({...formData, permissao: e.target.value as any})}>
                    <option value={Permissao.VIEW}>Ver</option>
                    <option value={Permissao.ADMIN}>Admin</option>
                </select>
                <button disabled={loading} className="bg-[#7d9d42] w-16 flex items-center justify-center text-white hover:bg-[#6e8e38]">
                    {loading ? <Loader2 className="animate-spin"/> : <Plus />}
                </button>
            </form>
            <ul className="space-y-4 bg-gray-100 p-4 rounded-xl max-h-[60vh] overflow-y-auto">
                {colaboradores && colaboradores.length > 0 ? colaboradores.map((c: any) => (
                    <li key={c.id} className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
                        <span className="truncate font-medium text-[#4a5e2a]">{c.email}</span>
                        <div className="flex gap-3 items-center">
                            <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded text-xs font-bold uppercase">{c.permissao}</span>
                            <button onClick={() => remove(c.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={18}/></button>
                        </div>
                    </li>
                )) : <p className="text-center text-gray-400 py-4">Nenhum colaborador vinculado.</p>}
            </ul>
        </div>
    </section>
  );
}

// --- COMPONENTES AUXILIARES ---
function DeleteConfirmationPopup({ onCancel, onConfirm }: any) {
  return (
    <dialog className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6 w-full h-full">
       <article className="bg-white rounded-[2rem] p-8 shadow-2xl w-full max-w-sm flex flex-col items-center border border-gray-100">
          <h2 className="text-[#2e3b1a] text-2xl font-bold mb-4">Excluir Talhão</h2>
          <p className="text-sm font-medium text-gray-600 mb-8 px-4 text-center">Tem certeza? <br/><span className="text-[#4a5e2a] font-bold">Esta ação é irreversível.</span></p>
          <nav className="flex gap-4 w-full">
              <button onClick={onCancel} className="flex-1 border-2 border-[#7d9d42] text-[#7d9d42] py-3 rounded-xl font-bold">Cancelar</button>
              <button onClick={onConfirm} className="flex-1 bg-red-50 text-red-500 border-2 border-red-100 py-3 rounded-xl font-bold">Excluir</button>
          </nav>
       </article>
    </dialog>
  );
}