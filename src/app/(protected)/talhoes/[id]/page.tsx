'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Eye, Trash2, Save, X, Loader2, Leaf } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { talhaoService } from '../../../services/talhaoService';
import { TalhaoDetalhadoDTO } from '../../../model/types/talhao'; 
import { Permissao, Medida } from '../../../model/types/enum';
import { useAuth } from '../../../hooks/useAuth';

import { useOperacaoForm } from '../../../hooks/useOperacaoForm';
import { useColaboradorForm } from '../../../hooks/useColaboradorForm';

import NewCultureModal from '../../../components/cultura'; 
import SensorModal from '../../../components/sensor';

export default function TalhaoDetailRefatorado({ params }: { params: Promise<{ id: string }> }) {
  
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  const [talhao, setTalhao] = useState<TalhaoDetalhadoDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [currentScreen, setCurrentScreen] = useState<'MAIN' | 'HISTORY' | 'COLLABORATORS' | 'ADD_OPERATION'>('MAIN');

  const [isCultureModalOpen, setIsCultureModalOpen] = useState(false);
  const [sensorModalState, setSensorModalState] = useState<{
    isOpen: boolean;
    type: 'TEMPERATURA' | 'UMIDADE' | null;
  }>({ isOpen: false, type: null });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const loadData = async () => {
    try {
      const data = await talhaoService.getDetalhado(id);
      setTalhao(data);
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

  const handleUpdateTalhao = async (dadosAtualizados: any) => {

    setSaving(true);
    try {
      const donoOriginalId = (talhao as any)?.idUsuario;
      console.log("🔍 ID do Dono Original encontrado:", donoOriginalId); 

      if (!donoOriginalId) {
          alert("Erro Crítico: O sistema não identificou o dono do talhão. Atualize a página e tente novamente.");
          setSaving(false);
          return;
      }

      const payload = {
        id: id, 
        nome: dadosAtualizados.nome,
        descricao: dadosAtualizados.descricao || "", 
        tamanho: Number(dadosAtualizados.tamanho),
        medida: dadosAtualizados.medida,
        fazendaId: (talhao as any)?.fazendaId,
        idUsuario: donoOriginalId
      };

      await talhaoService.update(id, payload);
      await loadData(); 
    } catch (error: any) {
      console.error("Erro detalhado:", error);
      const serverMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            JSON.stringify(error.response?.data) || 
                            "Verifique os dados enviados.";
      alert(`Erro ao atualizar: ${serverMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTalhao = async () => {
    try {
      await talhaoService.delete(id);
      router.push('/home');
    } catch (error) {
      alert('Erro ao excluir talhão.');
      setShowDeleteConfirm(false);
    }
  };

  const goTo = (screen: any) => setCurrentScreen(screen);
  const goBack = () => setCurrentScreen('MAIN');

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Loader2 className="w-10 h-10 text-[#6d8a44] animate-spin" />
        </div>
    );
  }

  if (!talhao) return null;

  const renderScreen = () => {
    switch (currentScreen) {
      case 'MAIN':
        return (
          <MainScreen 
            talhao={talhao}
            onSave={handleUpdateTalhao}
            isSaving={saving}
            goTo={goTo}
            router={router}
            openCultureModal={() => setIsCultureModalOpen(true)}
            openSensorModal={(type: 'TEMPERATURA' | 'UMIDADE') => setSensorModalState({ isOpen: true, type })}
            setShowDeleteConfirm={setShowDeleteConfirm}
          />
        );
      case 'HISTORY':
        return <HistoryScreen goBack={goBack} goTo={goTo} operacoes={talhao.operacoes || []} />;
      case 'ADD_OPERATION':
        return <AddOperationScreen goBack={() => goTo('HISTORY')} talhaoId={id} agente={user?.nome || 'Usuário'} onSuccess={loadData} />;
      default:
        return null;
    }
  };

  // Lógica para pegar a cultura atual (se existir) para passar para o modal
  const culturaObjeto = talhao.culturas && talhao.culturas.length > 0 ? talhao.culturas[0] : null;

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-gray-50 flex justify-center py-8 px-4 font-sans relative">
      <section className="w-full max-w-lg md:max-w-5xl">
        
        {renderScreen()}

        {showDeleteConfirm && (
          <DeleteConfirmationPopup 
            onCancel={() => setShowDeleteConfirm(false)} 
            onConfirm={handleDeleteTalhao}
          />
        )}

        {/* Atualizado para passar a cultura atual */}
        <NewCultureModal 
          isOpen={isCultureModalOpen} 
          onClose={() => setIsCultureModalOpen(false)} 
          talhaoId={id} 
          onSuccess={loadData}
          culturaAtual={culturaObjeto}
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

function MainScreen({ talhao, onSave, isSaving, goTo, router, openCultureModal, openSensorModal, setShowDeleteConfirm }: any) {
  
  const [formData, setFormData] = useState({
    nome: talhao.nome || '',
    descricao: talhao.descricao || '',
    tamanho: talhao.tamanho || 0,
    medida: talhao.medida
  });

  useEffect(() => {
    setFormData({
      nome: talhao.nome || '',
      descricao: talhao.descricao || '',
      tamanho: talhao.tamanho || 0,
      medida: talhao.medida
    });
  }, [talhao]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const [showTempGraph, setShowTempGraph] = useState(true);
  const [showHumidityGraph, setShowHumidityGraph] = useState(true);

  const culturaAtual = talhao.culturas?.length > 0 ? talhao.culturas[0].nome : "Sem cultura";
  const unidadeDisplay = talhao.medida === Medida.HECTARE ? 'ha' : 
                          talhao.medida === Medida.METROS_QUADRADOS ? 'm²' : 'km²';

  const mockData = [
    { dia: 'Seg', valor: 24 }, { dia: 'Ter', valor: 26 }, { dia: 'Qua', valor: 22 },
    { dia: 'Qui', valor: 28 }, { dia: 'Sex', valor: 25 },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
       <header className="flex items-center">
          <button onClick={() => router.push('/home')} className="text-[#6d8a44] hover:bg-gray-100 rounded-full transition-colors p-2">
            <ArrowLeft size={32} strokeWidth={2.5} />
          </button>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <section className="space-y-5">
            <section className="bg-white rounded-2xl shadow-md p-5 focus-within:ring-2 focus-within:ring-[#6d8a44] transition-all">
              <label htmlFor="nome" className="text-sm font-bold text-gray-800 mb-1 block">Nome do Talhão</label>
              <input 
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                className="w-full text-2xl font-bold text-[#6d8a44] border-b-2 border-transparent focus:border-[#6d8a44]/50 outline-none bg-transparent placeholder-green-700/30"
                placeholder="Digite o nome..."
              />
            </section>

            <article className="bg-white rounded-2xl shadow-md p-5 min-h-[150px] focus-within:ring-2 focus-within:ring-[#6d8a44] transition-all">
              <label htmlFor="descricao" className="text-sm font-bold text-gray-800 mb-2 block">Descrição</label>
              <textarea 
                id="descricao"
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                rows={4}
                className="w-full text-sm text-gray-600 leading-relaxed text-justify outline-none resize-none bg-transparent border-b-2 border-transparent focus:border-[#6d8a44]/50 placeholder-gray-300"
                placeholder="Insira uma descrição para o talhão..."
              />
            </article>

            <section className="grid grid-cols-3 gap-3">
              <article 
                className="bg-white rounded-2xl shadow-md p-2 flex flex-col items-center justify-between aspect-square focus-within:ring-2 focus-within:ring-[#6d8a44] transition-all group cursor-text hover:shadow-lg"
                onClick={() => document.getElementById('tamanho')?.focus()}
              >
                <label htmlFor="tamanho" className="text-[11px] font-bold text-[#4a5e2a] uppercase tracking-widest mt-2">
                  TAMANHO
                </label>
                
                <div className="flex-1 flex items-center justify-center w-full">
                  <input 
                      id="tamanho"
                      name="tamanho"
                      type="number"
                      value={formData.tamanho}
                      onChange={handleChange}
                      className="w-full text-4xl font-bold text-[#6d8a44] text-center bg-transparent outline-none border-none p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder-green-200"
                  />
                </div>
                
                <span className="text-[10px] text-[#4a5e2a] font-bold mb-2 uppercase">
                  {unidadeDisplay}
                </span>
              </article>

              <article className="bg-white rounded-2xl shadow-md p-3 flex flex-col items-center justify-between aspect-square group hover:shadow-lg transition-all">
                <h3 className="text-[11px] font-bold text-[#4a5e2a] uppercase tracking-widest mt-1">Equipe</h3>
                <span className="text-3xl font-bold text-[#6d8a44]">{talhao.colaboradores?.length || 0}</span>
                <button 
                  onClick={() => router.push(`/talhoes/${talhao.id}/colaboradores`)}
                  className="flex items-center gap-1 border border-[#6d8a44] text-[#6d8a44] px-2 py-1 rounded-full text-[10px] font-bold hover:bg-[#6d8a44] hover:text-white transition-all uppercase"
                >
                  <Plus size={10} strokeWidth={3} /> gerenciar
                </button>
              </article>

              <button 
                onClick={openCultureModal}
                className="bg-white rounded-2xl shadow-md p-3 flex flex-col items-center justify-between aspect-square hover:bg-gray-50 cursor-pointer border-2 border-transparent hover:border-[#6d8a44]/20 transition-all group hover:shadow-lg"
              >
                <h3 className="text-[11px] font-bold text-[#4a5e2a] uppercase tracking-widest mt-1">Cultura</h3>
                <span className="text-lg font-bold text-[#6d8a44] truncate w-full text-center px-1">
                  {culturaAtual}
                </span>
                <span className="text-[10px] text-[#4a5e2a] group-hover:text-[#6d8a44] transition-colors font-medium mb-1">
                  Alterar
                </span>
              </button>
            </section>
          </section>

          <section className="space-y-5">
            
            <button 
              onClick={() => router.push(`/talhoes/${talhao.id}/operacoes`)}
              className="w-full bg-white rounded-xl shadow-md flex items-center overflow-hidden h-14 group hover:scale-[1.01] transition-transform"
            >
              <span className="bg-[#6d8a44] h-full w-16 flex items-center justify-center">
                <Eye className="text-white" size={28} />
              </span>
              <span className="flex-1 text-[#6d8a44] font-semibold text-center">
                Visualizar histórico ({talhao.operacoes?.length || 0})
              </span>
            </button>

            <h2 className="text-lg font-bold text-black">Sensores</h2>
            <SensorCard 
              label="Temperatura" 
              showGraph={showTempGraph} 
              setShowGraph={setShowTempGraph} 
              data={mockData} 
              ip={talhao.sensorTemperatura?.ip}
              color="#6d8a44"
              onEdit={() => openSensorModal('TEMPERATURA')}
            />

            <SensorCard 
              label="Umidade" 
              showGraph={showHumidityGraph} 
              setShowGraph={setShowHumidityGraph} 
              data={mockData} 
              ip={talhao.sensorUmidade?.ip}
              color="#6d8a44"
              onEdit={() => openSensorModal('UMIDADE')}
            />

            <footer className="pt-4 pb-8 flex flex-col sm:flex-row gap-3 md:justify-end">
              <button 
                onClick={() => onSave(formData)}
                disabled={isSaving}
                className="flex items-center justify-center gap-2 px-8 py-3 rounded-2xl bg-[#6d8a44] text-white font-bold text-lg hover:brightness-90 active:scale-[0.99] transition-all focus:outline-none focus:ring-2 focus:ring-[#6d8a44] focus:ring-offset-2 w-full md:w-auto shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving ? <Loader2 className="animate-spin" /> : <>Salvar <Save size={24} aria-hidden="true" /></>}
              </button>

              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center justify-center gap-2 px-8 py-3 rounded-2xl border-2 border-red-500 text-red-500 font-bold hover:bg-red-50 transition-colors w-full md:w-auto"
              >
                Excluir <Trash2 size={24} />
              </button>
            </footer>
          </section>
        </section>
    </div>
  );
}

function HistoryScreen({ goBack, goTo, operacoes }: any) {
  return (
    <section className="h-full flex flex-col bg-white rounded-3xl shadow-xl overflow-hidden animate-in slide-in-from-right duration-300 min-h-[600px]">
      <header className="flex items-center justify-between p-6 border-b">
        <h1 className="text-2xl font-bold text-[#2e3b1a]">Histórico de Operações</h1>
        <button onClick={goBack} className="p-2 hover:bg-gray-100 rounded-full">
          <X size={32} />
        </button>
      </header>
      
      <div className="p-6 flex-1 overflow-y-auto">
        <ul className="space-y-3">
          {operacoes && operacoes.length > 0 ? operacoes.map((op: any) => (
            <li key={op.id} className="grid grid-cols-3 text-sm p-4 bg-gray-50 rounded-xl border border-gray-100 items-center">
               <span className="font-bold text-[#6d8a44]">{new Date(op.dataHora).toLocaleDateString()}</span>
               <span className="text-center font-medium text-gray-700">{op.operacao}</span>
               <span className="text-right text-gray-500 truncate text-xs">{op.agente}</span>
            </li>
          )) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                <Leaf size={48} className="opacity-20"/>
                <p>Nenhuma operação registrada.</p>
            </div>
          )}
        </ul>
      </div>

      <div className="p-6 border-t bg-gray-50">
        <button 
          onClick={() => goTo('ADD_OPERATION')}
          className="w-full bg-[#6d8a44] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#5c753a] transition-colors"
        >
          <Plus size={20} /> Registrar Nova Operação
        </button>
      </div>
    </section>
  );
}

// ============================================================================
// 4. SUB-TELA: ADICIONAR OPERAÇÃO (COM HOOK DE LÓGICA)
// ============================================================================
function AddOperationScreen({ goBack, talhaoId, agente, onSuccess }: any) {
  // Hook de lógica trazido do primeiro código
  const { formData, setFormData, submit, loading } = useOperacaoForm(talhaoId, agente, onSuccess);

  return (
    <section className="h-full flex flex-col bg-white rounded-3xl shadow-xl overflow-hidden animate-in slide-in-from-right duration-300 min-h-[600px] justify-center items-center p-6">
       <div className="w-full max-w-md">
           <h1 className="text-2xl font-bold text-[#2e3b1a] mb-8 text-center">Nova Operação</h1>
           
           <form onSubmit={submit} className="space-y-6">
             <div>
               <label className="font-bold text-[#4a5e2a] block mb-2">Data e Hora</label>
               <input 
                 type="datetime-local" 
                 className="w-full border rounded-2xl p-4 outline-none focus:border-[#4a5e2a] bg-gray-50"
                 value={formData.dataHora} 
                 onChange={e => setFormData({...formData, dataHora: e.target.value})} 
                 required 
               />
             </div>

             <div>
               <label className="font-bold text-[#4a5e2a] block mb-2">Descrição da Ação</label>
               <input 
                 type="text" 
                 className="w-full border rounded-2xl p-4 outline-none focus:border-[#4a5e2a] bg-gray-50" 
                 placeholder="Ex: Pulverização, Colheita..."
                 value={formData.operacao} 
                 onChange={e => setFormData({...formData, operacao: e.target.value})} 
                 required 
               />
             </div>

             <div>
               <label className="font-bold text-[#4a5e2a] block mb-2">Responsável</label>
               <input 
                 type="text" 
                 className="w-full border rounded-2xl p-4 bg-gray-200 text-gray-500 cursor-not-allowed"
                 value={formData.agente} 
                 disabled 
               />
             </div>

             <div className="flex gap-4 pt-4">
                 <button type="button" onClick={goBack} className="flex-1 border-2 border-[#4a5e2a] text-[#4a5e2a] py-3 rounded-2xl font-bold hover:bg-gray-50">
                   Cancelar
                 </button>
                 <button type="submit" disabled={loading} className="flex-1 bg-[#7d9d42] text-white py-3 rounded-2xl font-bold disabled:opacity-70 hover:bg-[#688337] flex justify-center items-center">
                   {loading ? <Loader2 className="animate-spin" /> : 'Salvar Registro'}
                 </button>
             </div>
           </form>
       </div>
    </section>
  );
}


// ============================================================================
// 6. COMPONENTES AUXILIARES
// ============================================================================

function SensorCard({ label, showGraph, setShowGraph, data, ip, color, onEdit }: any) {
  return (
    <section className="bg-white rounded-2xl shadow-md p-5 space-y-4">
      <div className="flex justify-between items-center">
        <label className="text-[#6d8a44] text-sm font-bold block">{label}</label>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-gray-400">Ver Gráfico</span>
          <button 
             onClick={() => setShowGraph(!showGraph)}
             className={`w-11 h-6 rounded-full transition-colors relative ${showGraph ? 'bg-[#6d8a44]' : 'bg-gray-200'}`}
          >
             <span className={`absolute top-[2px] left-[2px] bg-white w-5 h-5 rounded-full transition-transform ${showGraph ? 'translate-x-5' : ''}`} />
          </button>
        </div>
      </div>

      {!showGraph ? (
        <div className="flex rounded-lg shadow-sm border border-gray-200 overflow-hidden h-12">
          <span className="flex-1 px-4 text-gray-600 flex items-center bg-transparent truncate">
              {ip || "Não instalado"}
          </span>
          <button onClick={onEdit} className="bg-[#6d8a44] text-white px-6 font-medium hover:brightness-90 h-full">
            Editar
          </button>
        </div>
      ) : (
        <div className="mt-4 h-48 w-full bg-gray-50 rounded-lg p-2 border border-gray-100">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="dia" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
              <Tooltip />
              <Line type="monotone" dataKey="valor" stroke={color} strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

function DeleteConfirmationPopup({ onCancel, onConfirm }: any) {
  return (
    <dialog className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6 w-full h-full animate-in fade-in duration-200">
       <div className="bg-white rounded-[2rem] p-8 shadow-2xl w-full max-w-sm flex flex-col items-center border border-gray-100">
         <h2 className="text-[#2e3b1a] text-2xl font-bold mb-4">Excluir Talhão</h2>
         <p className="text-sm font-medium text-gray-600 mb-8 px-4 text-center">
           Tem certeza? <br/><span className="text-red-500 font-bold">Esta ação é irreversível.</span>
         </p>
         <div className="flex gap-4 w-full">
             <button onClick={onCancel} className="flex-1 border-2 border-[#7d9d42] text-[#7d9d42] py-3 rounded-xl font-bold hover:bg-green-50">Cancelar</button>
             <button onClick={onConfirm} className="flex-1 bg-red-50 text-red-500 border-2 border-red-100 py-3 rounded-xl font-bold hover:bg-red-100">Excluir</button>
         </div>
       </div>
    </dialog>
  );
}