'use client';
import { useState } from 'react';
import { operacaoService } from '../services/operacaoService';

export function useOperacaoForm(talhaoId: string, agenteInicial: string, onSuccess: () => void) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ 
        operacao: '', 
        agente: agenteInicial, 
        dataHora: '' 
    });

    const submit = async (e: React.FormEvent) => {
        // Se for chamado por um botão type="button", o preventDefault pode não existir
        if (e) e.preventDefault(); 
        
        setLoading(true);
        try {
            await operacaoService.create({
                operacao: formData.operacao,
                agente: formData.agente,
                dataHora: new Date(formData.dataHora).toISOString(), // Converte datetime-local para ISO
                idTalhao: talhaoId
            });
            alert('Operação registrada!');
            setFormData({ ...formData, operacao: '', dataHora: '' });
            onSuccess();
        } catch (error) {
            console.error(error);
            alert('Erro ao registrar operação.');
        } finally {
            setLoading(false);
        }
    };

    return { formData, setFormData, submit, loading };
}