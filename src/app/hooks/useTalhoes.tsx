'use client';

import { useState, useEffect, useCallback } from 'react';
import { talhaoService } from '../services/talhaoService';
import { TalhaoRequestDTO, TalhaoResponseDTO } from '../model/types/talhao';

export function useTalhoes() {
    const [talhoes, setTalhoes] = useState<TalhaoResponseDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Função para carregar a lista
    const fetchTalhoes = useCallback(async () => {
        setLoading(true);
        try {
            // Trocamos para listarAtivos se quiser filtrar os deletados
            const data = await talhaoService.getActives(); 
            setTalhoes(data);
        } catch (err) {
            console.error(err);
            setError('Erro ao carregar talhões.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Carrega ao iniciar
    useEffect(() => {
        fetchTalhoes();
    }, [fetchTalhoes]);

    // Função para criar
    const createTalhao = async (payload: TalhaoRequestDTO) => {
        setLoading(true);
        try {
            await talhaoService.create(payload);
            await fetchTalhoes(); // Recarrega a lista após criar
            return true; // Sucesso
        } catch (err) {
            console.error(err);
            setError('Erro ao criar talhão.');
            return false; // Falha
        } finally {
            setLoading(false);
        }
    };

    return {
        talhoes,
        loading,
        error,
        createTalhao,
        refresh: fetchTalhoes
    };
}