'use client';
import { useState } from 'react';
import { culturaService } from '../services/culturaService';

export function useCulturaForm(talhaoId: string, onSuccess: () => void) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ nome: '', data: '' });

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await culturaService.create({
                nome: formData.nome,
                data: formData.data, // O input type="date" já manda YYYY-MM-DD
                idTalhao: talhaoId
            });
            alert('Cultura registrada com sucesso!');
            setFormData({ nome: '', data: '' }); // Limpa form
            onSuccess(); // Recarrega a página principal
        } catch (error) {
            console.error(error);
            alert('Erro ao registrar cultura.');
        } finally {
            setLoading(false);
        }
    };

    return { formData, setFormData, submit, loading };
}