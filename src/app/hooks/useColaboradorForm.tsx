'use client';
import { useState } from 'react';
import { colaboradorService } from '../services/colaboradorService';
import { Permissao } from '../model/types/enum';

export function useColaboradorForm(talhaoId: string, onSuccess: () => void) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ 
        email: '', 
        permissao: Permissao.VIEW 
    });

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await colaboradorService.create({
                email: formData.email,
                permissao: formData.permissao,
                idTalhao: talhaoId
            });
            alert('Colaborador convidado!');
            setFormData({ email: '', permissao: Permissao.VIEW });
            onSuccess();
        } catch (error) {
            console.error(error);
            alert('Erro ao adicionar colaborador. Verifique o email.');
        } finally {
            setLoading(false);
        }
    };

    const remove = async (id: string) => {
        if(confirm("Remover colaborador?")) {
            try {
                await colaboradorService.delete(id);
                onSuccess();
            } catch(e) { alert('Erro ao remover.'); }
        }
    }

    return { formData, setFormData, submit, remove, loading };
}