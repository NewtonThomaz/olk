'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, ChevronDown, Plus, Loader2 } from 'lucide-react';
// Importando o hook
import { useSensorForm } from '../hooks/useSensorForm';

interface SensorModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'TEMPERATURA' | 'UMIDADE' | null; // Tipagem forte para bater com o hook
  talhaoId: string;
  onSuccess: () => void;
}

export default function SensorModal({ isOpen, onClose, type, talhaoId, onSuccess }: SensorModalProps) {
  const [viewState, setViewState] = useState<'select' | 'create'>('select');
  
  // Conectando o Hook
  // O hook espera 'TEMPERATURA' ou 'UMIDADE' maiúsculo
  const { ip, setIp, submit, loading } = useSensorForm(
      talhaoId, 
      type || 'TEMPERATURA', 
      () => { onSuccess(); handleClose(); }
  );

  // Lista simulada para o dropdown (opcional, já que o backend não fornece lista de livres)
  const mockSensors = [
    { id: '1', info: '192.168.0.50' },
    { id: '2', info: '192.168.0.101' },
    { id: '3', info: '192.168.0.102' },
  ];

  if (!isOpen) return null;

  const handleClose = () => {
    setViewState('select');
    setIp(''); // Limpa o IP do hook
    onClose();
  };

  const title = type === 'TEMPERATURA' ? 'Sensor de Temperatura' : 'Sensor de Umidade';

  // Handler para salvar (chama o submit do hook)
  const handleSave = async () => {
      await submit();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-opacity duration-300 cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
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
            {viewState === 'select' ? 'Configurar Sensor' : 'Novo IP'}
          </h2>
        </div>

        {viewState === 'select' && (
          <div className="space-y-6">
            <p className="text-gray-500 text-sm -mt-6 mb-4 ml-12">
              Configurando {title}
            </p>

            <div className="relative">
              <select 
                className="w-full appearance-none border border-gray-300 rounded-full py-3 px-4 text-gray-700 focus:outline-none focus:border-[#6d8a44] focus:ring-1 focus:ring-[#6d8a44] bg-white cursor-pointer shadow-sm"
                value={ip}
                onChange={(e) => setIp(e.target.value)} // Conecta ao Hook
              >
                <option value="" disabled>Selecione ou Digite Manualmente</option>
                {mockSensors.map((sensor) => (
                  <option key={sensor.id} value={sensor.info}>
                    {sensor.info}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6d8a44] pointer-events-none" />
            </div>

            <button 
              onClick={() => setViewState('create')}
              className="flex items-center gap-2 text-[#6d8a44] text-sm font-medium hover:underline pl-1 group"
            >
              <div className="bg-[#6d8a44] text-white rounded-full p-0.5 group-hover:brightness-90 transition-all">
                <Plus size={14} />
              </div>
              Digitar IP manualmente
            </button>

            <div className="flex gap-3 mt-8">
              <button 
                onClick={handleClose}
                className="flex-1 border border-[#6d8a44] text-gray-800 font-bold py-3 rounded-full hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave} 
                disabled={loading || !ip}
                className="flex-1 bg-[#6d8a44] text-white font-bold py-3 rounded-full hover:brightness-90 transition shadow-md flex justify-center items-center disabled:opacity-70"
              >
                {loading ? <Loader2 className="animate-spin"/> : 'Salvar'}
              </button>
            </div>
          </div>
        )}

        {/* Formulário visual manual */}
        {viewState === 'create' && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 ml-2 mb-1">Endereço IP</label>
              <input 
                type="text" 
                placeholder="Ex: 192.168.0.100"
                value={ip}
                onChange={(e) => setIp(e.target.value)} // Conecta ao Hook
                className="w-full border border-gray-300 rounded-full py-3 px-4 text-gray-700 focus:outline-none focus:border-[#6d8a44] focus:ring-1 focus:ring-[#6d8a44] shadow-sm"
              />
            </div>
            
            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setViewState('select')}
                className="flex-1 bg-gray-100 text-gray-800 font-bold py-3 rounded-full hover:bg-gray-200 transition"
              >
                Voltar
              </button>
              <button 
                onClick={handleSave}
                disabled={loading || !ip}
                className="flex-1 bg-[#6d8a44] text-white font-bold py-3 rounded-full hover:brightness-90 transition shadow-md flex justify-center items-center disabled:opacity-70"
              >
                {loading ? <Loader2 className="animate-spin"/> : 'Registrar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}