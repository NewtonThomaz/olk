'use client';
import { useState } from 'react';
import { culturaService } from '../services/culturaService';
import { useAuth } from './useAuth'; // <--- Importe o useAuth

export function useCulturaForm(talhaoId: string, onSuccess: () => void) {
    const { user } = useAuth(); // <--- Pega o usuário logado
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ nome: '' });

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validação de segurança
        if (!user?.id) {
            alert("Erro: Usuário não identificado. Recarregue a página.");
            return;
        }

        setLoading(true);

        try {
            // Montagem do Payload exatamente como o Backend pede
            const payload = {
                nome: formData.nome,
                usuario: {
                    id: user.id
                },
                talhoes: [
                    { id: talhaoId }
                ]
            };

            // O service agora recebe o payload estruturado
            await culturaService.create(payload);
            
            alert('Cultura registrada com sucesso!');
            setFormData({ nome: '' });
            onSuccess(); 
        } catch (error) {
            console.error(error);
            alert('Erro ao registrar cultura.');
        } finally {
            setLoading(false);
        }
    };

    return { formData, setFormData, submit, loading };
}