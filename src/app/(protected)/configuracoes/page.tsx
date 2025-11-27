'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, ArrowLeft, LogOut, Moon, ScrollText, Info, LucideIcon, Sprout } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

// --- Interfaces ---
interface Plot {
    id: number;
    name: string;
    isActive: boolean;
}

interface ToggleSwitchProps {
    value: boolean;
    onChange: (newValue: boolean) => void;
}

interface SettingsItemProps {
    label: string;
    action?: (newValue?: boolean) => void;
    Icon?: LucideIcon;
    isToggle?: boolean;
    initialValue?: boolean;
    showArrow?: boolean;
    isLast?: boolean; // Para controlar a borda inferior
}

// --- Cores e Constantes ---
const PRIMARY_GREEN = '#609340';

const initialPlots: Plot[] = [
    { id: 1, name: "Talhão 1 Cultivo", isActive: true },
    { id: 2, name: "Talhão 2 Cultivo", isActive: false },
    { id: 3, name: "Talhão 3 Cultivo", isActive: false },
    // { id: 4, name: "Talhão 4 Cultivo", isActive: true },
];

// --- Componentes Menores ---

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ value, onChange }) => (
    <div
        className={`relative inline-block w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer ${value ? 'bg-[#609340]' : 'bg-gray-200'}`}
        onClick={() => onChange(!value)}
    >
        <span
            className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${value ? 'translate-x-5' : 'translate-x-0'}`}
        />
    </div>
);

const SettingsItem: React.FC<SettingsItemProps> = ({ label, action, Icon, isToggle = false, initialValue = false, showArrow = true, isLast = false }) => {
    const [value, setValue] = useState<boolean>(initialValue || false);

    const handleClick = () => {
        if (isToggle) {
            const newValue = !value;
            setValue(newValue);
            if (action) action(newValue);
        } else {
            if (action) action();
        }
    };

    return (
        <div 
            onClick={!isToggle ? handleClick : undefined}
            className={`flex items-center justify-between p-4 bg-white cursor-pointer active:bg-gray-50 transition-colors ${!isLast ? 'border-b border-gray-100' : ''}`}
        >
            <div className="flex items-center gap-3">
                {Icon && (
                    <div className="p-2 bg-green-50 text-[#609340] rounded-lg">
                        <Icon size={20} />
                    </div>
                )}
                <span className="text-gray-700 font-medium text-sm">{label}</span>
            </div>

            {isToggle ? (
                <ToggleSwitch value={value} onChange={handleClick} />
            ) : (
                showArrow && <ChevronRight size={18} className="text-gray-400" />
            )}
        </div>
    );
};

// --- Componente Principal ---

export default function Settings() {
    const { logout } = useAuth();
    const router = useRouter();
    const [plots, setPlots] = useState<Plot[]>(initialPlots);

    const handlePlotToggle = (id: number, isActive: boolean) => {
        setPlots(prev => prev.map(plot => 
            plot.id === id ? { ...plot, isActive } : plot
        ));
    };

    return (
        // AJUSTE FINAL: Removemos 'h-screen' e 'bg-color' daqui para não conflitar com o layout pai.
        <main className="w-full font-sans relative">
            
            {/* CAMADA DE FUNDO FIXA: 
                Cobre 100% da tela visualmente (-z-10) sem afetar o scroll do conteúdo.
                Resolve a "barra branca" no desktop e o "estouro" no mobile.
            */}
            <div className="fixed inset-0 bg-[#609340] -z-10" />

            {/* Header da Página */}
            <header className="flex items-center p-6 text-white sticky top-0 z-10">
                {/* Adicionado backdrop-blur leve para o header não misturar com conteúdo ao rolar */}
                <div className="absolute inset-0 bg-[#609340]/95 backdrop-blur-sm -z-10 shadow-sm" />
                
                <button 
                    onClick={() => router.back()} 
                    className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors relative z-20"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="flex-1 text-center text-xl font-bold tracking-wide relative z-20">Configurações</h1>
                <div className="w-10 relative z-20" />
            </header>

            {/* Conteúdo Centralizado */}
            <div className="w-full max-w-lg mx-auto px-4 pb-12 space-y-8 pt-4">

                {/* Seção Geral */}
                <section>
                    <h2 className="text-white/90 text-xs font-bold uppercase tracking-wider mb-3 px-2">
                        Geral
                    </h2>
                    <div className="rounded-2xl overflow-hidden shadow-lg bg-white">
                        <SettingsItem 
                            label="Modo Escuro" 
                            Icon={Moon} 
                            isToggle 
                        />
                        <SettingsItem 
                            label="Políticas de Privacidade" 
                            Icon={ScrollText} 
                        />
                        <SettingsItem 
                            label="Sobre o App" 
                            Icon={Info} 
                            isLast
                        />
                    </div>
                </section>

                {/* Seção Talhões */}
                <section>
                    <h2 className="text-white/90 text-xs font-bold uppercase tracking-wider mb-3 px-2">
                        Gerenciar Talhões
                    </h2>
                    <div className="rounded-2xl overflow-hidden shadow-lg bg-white">
                        {plots.map((plot, index) => (
                            <div 
                                key={plot.id} 
                                className={`flex items-center justify-between p-4 bg-white ${index !== plots.length - 1 ? 'border-b border-gray-100' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${plot.isActive ? 'bg-green-50 text-[#609340]' : 'bg-gray-100 text-gray-400'}`}>
                                        <Sprout size={20} />
                                    </div>
                                    <span className={`text-sm font-medium ${plot.isActive ? 'text-gray-700' : 'text-gray-400'}`}>
                                        {plot.name}
                                    </span>
                                </div>
                                <ToggleSwitch 
                                    value={plot.isActive} 
                                    onChange={(val) => handlePlotToggle(plot.id, val)} 
                                />
                            </div>
                        ))}
                    </div>
                    <p className="text-white/70 text-xs mt-2 px-2">
                        Talhões desativados não aparecerão na tela inicial.
                    </p>
                </section>

                {/* Botão de Sair */}
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 p-4 mt-8 rounded-2xl bg-[#527d36] text-white font-bold shadow-lg hover:bg-[#466a2e] transition-all active:scale-[0.98]"
                >
                    <LogOut size={20} />
                    Sair da Conta
                </button>

                <div className="text-center pb-4">
                    <span className="text-white/50 text-xs">Versão 1.0.2</span>
                </div>

            </div>
        </main>
    );
}